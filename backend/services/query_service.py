import os
import json
import re
import asyncio
import time

import google.generativeai as genai
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from qdrant_client.models import (
    Filter,
    FieldCondition,
    MatchValue,
)

from prompts.qa_prompt import QA_PROMPT
from prompts.query_entity_prompt import QUERY_ENTITY_PROMPT
from vectorstore.qdrant_client import get_collection_name, get_qdrant_client
from services.graph_client import get_neo4j_driver

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

EMBEDDING_MODEL = "models/gemini-embedding-001"

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.2,
    max_output_tokens=8192,
)

def _clean_json_response(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()
    
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1:
        raw = raw[start:end+1]
        
    return raw

def _embed_question(question: str) -> list[float]:
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=question,
        task_type="retrieval_query",
    )
    return result["embedding"]

async def _extract_query_entities(question: str) -> list[str]:
    prompt = QUERY_ENTITY_PROMPT.format(question=question)
    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        cleaned = _clean_json_response(response.content)
        entities = json.loads(cleaned)
        if isinstance(entities, list):
            return [str(e) for e in entities]
    except Exception as e:
        print(f"⚠️ Query entity extraction failed: {e}")
    return []

def _get_graph_context(user_id: str, entities: list[str]) -> tuple[str, list[dict]]:
    if not entities:
        return "No graph entities identified.", []
        
    driver = get_neo4j_driver()
    if not driver:
        return "Graph database unavailable.", []

    with driver.session() as session:
        # Match any entity whose name contains one of our query entities
        # and traverse 1 hop along edges owned by this user
        result = session.run(
            """
            UNWIND $entities AS ent
            MATCH (e:Entity)-[r:RELATED_TO {user_id: $user_id}]-(other:Entity)
            WHERE toLower(e.name) CONTAINS toLower(ent)
            RETURN e.name AS source, r.name AS relation, other.name AS target
            LIMIT 40
            """,
            entities=entities,
            user_id=user_id
        )
        records = list(result)

    if not records:
        return "No direct relationships found in your knowledge graph.", []

    # Format graph edges as text for the LLM and capture structured facts
    lines = set()
    graph_facts = []
    seen_facts = set()
    
    for rec in records:
        source = rec['source']
        relation = rec['relation']
        target = rec['target']
        
        # Text for Gemini
        lines.add(f"({source}) -[{relation}]-> ({target})")
        
        # Structured facts for frontend
        fact_key = f"{source}-{relation}-{target}"
        if fact_key not in seen_facts:
            seen_facts.add(fact_key)
            graph_facts.append({
                "source": source,
                "relation": relation,
                "target": target
            })
    
    return "\n".join(list(lines)), graph_facts

def _get_chunk_context(user_id: str, question_vector: list[float], top_k: int) -> tuple[str, list[dict]]:
    client = get_qdrant_client()
    response = client.query_points(
        collection_name=get_collection_name(),
        query=question_vector,
        limit=top_k,
        query_filter=Filter(
            must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))]
        ),
        with_payload=True,
    )

    results = response.points
    if not results:
        return "No relevant text chunks found.", []

    context_parts = []
    sources = []
    seen_papers = set()

    for i, hit in enumerate(results, 1):
        p = hit.payload
        paper_id = p.get("paper_id", "Unknown")
        title = p.get("title", "Unknown")
        
        context_parts.append(
            f"--- CHUNK {i} ---\n"
            f"Paper: {title}\n"
            f"Section: {p.get('section', 'Unknown')}\n"
            f"Text: {p.get('chunk_text', '')}\n"
        )

        # Track unique papers for the sources return
        if paper_id not in seen_papers:
            seen_papers.add(paper_id)
            sources.append({
                "paper_id": paper_id,
                "title": title,
                "authors": p.get("authors", []),
                "published_date": p.get("published_date", "Unknown"),
                "score": round(hit.score, 4),
            })

    return "\n".join(context_parts), sources

async def answer_question(question: str, user_id: str, top_k: int = 8) -> dict:
    """
    Graph RAG Pipeline:
    1. Embed question -> Qdrant search
    2. Extract entities -> Neo4j search
    3. Combine contexts -> Gemini Generation
    """
    
    print(f"\n--- Processing Query: {question} ---")
    t0 = time.time()
    
    # Run embedding and entity extraction in parallel
    question_vector_task = asyncio.to_thread(_embed_question, question)
    entities_task = _extract_query_entities(question)
    
    question_vector, query_entities = await asyncio.gather(
        question_vector_task, 
        entities_task
    )
    
    t1 = time.time()
    print(f"⏱️ Embedding + Entity Extraction took: {t1 - t0:.3f} seconds")

    # Fetch context from DBs in parallel
    t2 = time.time()
    graph_context_task = asyncio.to_thread(_get_graph_context, user_id, query_entities)
    chunk_context_task = asyncio.to_thread(_get_chunk_context, user_id, question_vector, top_k)

    (graph_context_text, graph_facts), (chunk_context, sources) = await asyncio.gather(
        graph_context_task,
        chunk_context_task
    )
    t3 = time.time()
    print(f"⏱️ Qdrant Vector + Neo4j Graph Retrieval took: {t3 - t2:.3f} seconds")

    print(f"\n🔍 Query: '{question}'")
    print(f"   Entities extracted: {query_entities}")
    print(f"   Graph context edges: {len(graph_facts)}")
    print(f"   Qdrant chunks retrieved: {top_k if sources else 0}")

    if not sources and not graph_facts:
        return {
            "answer": "No relevant papers or knowledge graph connections found in your library for this question.",
            "sources": [],
            "graph_facts": []
        }

    # Generate Answer
    prompt = QA_PROMPT.format(
        graph_context=graph_context_text,
        chunk_context=chunk_context,
        question=question,
    )

    t4 = time.time()
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    t5 = time.time()
    
    print(f"⏱️ Gemini Answer Generation took: {t5 - t4:.3f} seconds")
    print(f"⏱️ TOTAL PIPELINE LATENCY: {t5 - t0:.3f} seconds\n")

    return {
        "answer": response.content,
        "sources": sources,
        "graph_facts": graph_facts
    }