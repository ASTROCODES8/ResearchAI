"""
entity_extraction_service.py  —  Stage 3: Extract entities + relations via Gemini

Responsibilities
────────────────
  • Take the full text of a paper
  • Call Gemini once to extract structured entities + relations
  • Validate and clean the JSON response
  • Return a clean dict ready for Neo4j in Stage 4

Design decisions
────────────────
  • Reuses the same LLM instance pattern and _clean_json_response helper
    from paper_service.py (your existing style).

  • Sends the FULL paper text in one shot, not chunk-by-chunk:
      - 4–15 page papers = 5k–20k tokens → fits in Gemini Flash context
      - One call avoids duplicate entities across chunks
      - Saves API calls (free tier friendly)

  • This is a PURE extraction service — no DB writes. Stage 4 handles Neo4j.

  • If Gemini returns malformed JSON or the call fails entirely, we return
    an empty result rather than crashing. Graph extraction is an enhancement
    layer — the paper should still be saved even if this step fails.
"""

import os
import json
import re
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from prompts.graph_extraction_prompt import GRAPH_EXTRACTION_PROMPT

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.1,
)


def _clean_json_response(raw: str) -> str:
    """Strip markdown code fences if present — same helper as paper_service."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _validate_extraction(data: dict) -> dict:
    """
    Normalise + validate the extracted graph data.

    Ensures:
      • 'entities' is a list of dicts with 'name' and 'type'
      • 'relations' is a list of dicts with 'source', 'relation', 'target'
      • Entity names in relations actually exist in the entities list
      • All names are stripped and non-empty
    """
    raw_entities = data.get("entities", [])
    raw_relations = data.get("relations", [])

    # Clean entities
    entities = []
    entity_names = set()
    for ent in raw_entities:
        if not isinstance(ent, dict):
            continue
        name = str(ent.get("name", "")).strip()
        etype = str(ent.get("type", "Unknown")).strip()
        if name:
            entities.append({"name": name, "type": etype})
            entity_names.add(name)

    # Clean relations — only keep those where both source and target exist
    relations = []
    for rel in raw_relations:
        if not isinstance(rel, dict):
            continue
        source = str(rel.get("source", "")).strip()
        relation = str(rel.get("relation", "")).strip()
        target = str(rel.get("target", "")).strip()
        if source and relation and target and source in entity_names and target in entity_names:
            relations.append({"source": source, "relation": relation, "target": target})

    return {"entities": entities, "relations": relations}


async def extract_graph_data(full_text: str) -> dict:
    """
    Main entry point for Stage 3.

    Takes the full paper text and returns:
      {
        "entities":  [{"name": "BERT", "type": "Model"}, ...],
        "relations": [{"source": "BERT", "relation": "USES", "target": "Transformer"}, ...]
      }

    On failure, returns {"entities": [], "relations": []} — never raises.
    """
    if not full_text.strip():
        return {"entities": [], "relations": []}

    prompt = GRAPH_EXTRACTION_PROMPT.format(text=full_text)

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw_content = response.content

        cleaned = _clean_json_response(raw_content)
        data = json.loads(cleaned)

        result = _validate_extraction(data)

        print(f"✅  Graph extraction: {len(result['entities'])} entities, {len(result['relations'])} relations")
        return result

    except json.JSONDecodeError as e:
        print(f"⚠️  Graph extraction returned invalid JSON: {e}")
        return {"entities": [], "relations": []}

    except Exception as e:
        print(f"⚠️  Graph extraction failed: {e}")
        return {"entities": [], "relations": []}
