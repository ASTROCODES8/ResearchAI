import os
import uuid
import google.generativeai as genai
from dotenv import load_dotenv
from qdrant_client.models import (
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    FilterSelector,
)

from vectorstore.qdrant_client import get_qdrant_client, get_collection_name

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

EMBEDDING_MODEL = "models/gemini-embedding-001"


def _embed_text(text: str) -> list[float]:
    """Embed text using Gemini text-embedding-004 (768 dimensions)."""
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_document",
    )
    return result["embedding"]


def upsert_paper_embedding(
    paper_id: str,
    user_id: str,
    title: str,
    authors: list[str],
    published_date: str,
    overview: str,
):
    """
    Embed the paper overview and upsert into Qdrant.
    paper_id is the MongoDB ObjectId string.
    Qdrant requires integer or UUID point IDs — we derive a UUID from paper_id.
    """
    text_to_embed = f"Title: {title}\n\nSummary: {overview}"
    embedding = _embed_text(text_to_embed)

    # Derive a stable UUID from the MongoDB ObjectId string
    point_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, paper_id))

    client = get_qdrant_client()
    collection = get_collection_name()

    client.upsert(
        collection_name=collection,
        points=[
            PointStruct(
                id=point_uuid,
                vector=embedding,
                payload={
                    "paper_id":       paper_id,   # original MongoDB _id
                    "user_id":        user_id,
                    "title":          title,
                    "authors":        ", ".join(authors),
                    "published_date": published_date,
                    "overview":       overview,
                },
            )
        ],
    )
    print(f"✅  Embedded '{title}' → Qdrant (point_id={point_uuid})")


# ─── Stage 2: chunk-level embedding ─────────────────────────────────────────

def upsert_chunk_embeddings(
    paper_id: str,
    user_id: str,
    title: str,
    authors: list[str],
    published_date: str,
    chunks: list,          # List[Chunk] from chunking_service
) -> int:
    """
    Embed every high-value chunk from chunking_service and upsert into Qdrant.

    Each chunk becomes one Qdrant point. Low-value chunks (acknowledgements,
    appendix) are skipped — they add noise without retrieval benefit.

    Point ID is a stable UUID derived from paper_id + chunk_index so the
    function is safely idempotent (upsert won't duplicate on retry).

    Returns the number of chunks actually stored.
    """
    client = get_qdrant_client()
    collection = get_collection_name()

    points = []
    for chunk in chunks:
        if chunk.is_low_value:
            continue

        # Prepend title so the embedding captures paper identity too
        text_to_embed = f"Title: {title}\n\n{chunk.text}"
        embedding = _embed_text(text_to_embed)

        # Stable UUID: same paper_id + chunk_index always gives same UUID
        point_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{paper_id}_{chunk.chunk_index}"))

        points.append(
            PointStruct(
                id=point_uuid,
                vector=embedding,
                payload={
                    "paper_id":       paper_id,
                    "user_id":        user_id,
                    "chunk_index":    chunk.chunk_index,
                    "section":        chunk.section,
                    "chunk_text":     chunk.text,
                    "token_estimate": chunk.token_estimate,
                    "title":          title,
                    "authors":        ", ".join(authors),
                    "published_date": published_date,
                },
            )
        )

    if points:
        client.upsert(collection_name=collection, points=points)

    print(f"✅  Chunk-embedded '{title}' → Qdrant ({len(points)} chunks stored)")
    return len(points)


def delete_paper_embedding(paper_id: str):
    """
    Remove ALL Qdrant points that belong to this paper.

    Uses a filter-based delete (match on paper_id payload field) so it
    correctly removes both old single-point papers and new multi-chunk papers.
    """
    client = get_qdrant_client()
    client.delete(
        collection_name=get_collection_name(),
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="paper_id",
                        match=MatchValue(value=paper_id),
                    )
                ]
            )
        ),
    )
    print(f"🗑️  Deleted all Qdrant points for paper_id={paper_id}")