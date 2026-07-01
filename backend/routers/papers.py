import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from bson import ObjectId
from qdrant_client.models import Filter, FieldCondition, MatchValue

from database import get_db
from services.auth_dependency import get_current_user
from services.paper_service import extract_paper_summary, extract_text_from_pdf_bytes
from services.cloudinary_service import upload_pdf, delete_pdf
from services.embedding_service import upsert_chunk_embeddings
from services.chunking_service import chunk_paper
from services.entity_extraction_service import extract_graph_data
from services.graph_service import upsert_paper_graph
from vectorstore.qdrant_client import get_qdrant_client, get_collection_name
from services.graph_client import get_neo4j_driver

router = APIRouter(prefix="/papers", tags=["papers"])


def _serialize_paper(doc: dict) -> dict:
    """Convert MongoDB doc to JSON-serialisable dict."""
    return {
        "id":             str(doc["_id"]),
        "user_id":        doc["user_id"],
        "title":          doc["title"],
        "authors":        doc["authors"],
        "published_date": doc["published_date"],
        "overview":       doc["overview"],
        "pdf_url":        doc["pdf_url"],
        "created_at":     doc["created_at"].isoformat(),
    }


# ─── Upload + process ────────────────────────────────────────────────────────

@router.post("/upload", status_code=201)
async def upload_paper(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()

    # 1. Extract text + summary via Gemini (blocking call wrapped in to_thread)
    try:
        text = extract_text_from_pdf_bytes(pdf_bytes)
        summary = await extract_paper_summary(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini processing error: {e}")

    # 2. Upload PDF to Cloudinary
    try:
        cloud = await upload_pdf(pdf_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload error: {e}")

    # 3. Persist to MongoDB
    db = get_db()
    doc = {
        "user_id":              user_id,
        "title":                summary["title"],
        "authors":              summary["authors"],
        "published_date":       summary["published_date"],
        "overview":             summary["overview"],
        "pdf_url":              cloud["url"],
        "cloudinary_public_id": cloud["public_id"],
        "created_at":           datetime.now(timezone.utc),
    }
    result = await db.papers.insert_one(doc)
    doc["_id"] = result.inserted_id

    # -- STAGE 2: Chunking & Embeddings --
    try:
        chunks = chunk_paper(text)
        # Offload Qdrant IO to a thread
        await asyncio.to_thread(
            upsert_chunk_embeddings,
            str(doc["_id"]),
            user_id,
            doc["title"],
            doc["authors"],
            doc["published_date"],
            chunks
        )
        print(f"✅ Vectors written → Qdrant")
    except Exception as e:
        print(f"⚠️ Vector insertion failed for paper {doc['_id']}: {e}")

    # -- STAGE 4: Graph Extraction & Writing --
    try:
        # 1. Extract relationships using Gemini
        graph_data = await extract_graph_data(text)
        # 2. Write to Neo4j (Offload blocking IO to a thread)
        await asyncio.to_thread(upsert_paper_graph, str(doc["_id"]), user_id, graph_data)
        print(f"✅ Graph written → Neo4j")
    except Exception as e:
        print(f"⚠️ Neo4j write failed for paper {doc['_id']}: {e}")

    return _serialize_paper(doc)


# ─── History — list all papers for user ──────────────────────────────────────

@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.papers.find({"user_id": user_id}).sort("created_at", -1)
    papers = []
    async for doc in cursor:
        papers.append(_serialize_paper(doc))
    return {"papers": papers, "total": len(papers)}


# ─── Single paper ─────────────────────────────────────────────────────────────

@router.get("/{paper_id}")
async def get_paper(paper_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(paper_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid paper ID")

    doc = await db.papers.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Paper not found")

    return _serialize_paper(doc)


# ─── Delete paper ─────────────────────────────────────────────────────────────

@router.delete("/{paper_id}")
async def delete_paper(paper_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(paper_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid paper ID")

    # 1. Verify ownership (MongoDB)
    doc = await db.papers.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Paper not found")

    # 2. Delete from Qdrant
    try:
        q_client = get_qdrant_client()
        if q_client:
            await asyncio.to_thread(
                q_client.delete,
                collection_name=get_collection_name(),
                points_selector=Filter(
                    must=[FieldCondition(key="paper_id", match=MatchValue(value=paper_id))]
                )
            )
            print(f"✅ Deleted chunks from Qdrant for paper {paper_id}")
    except Exception as e:
        print(f"⚠️ Failed to delete chunks from Qdrant for paper {paper_id}: {e}")

    # 3. Delete from Neo4j
    try:
        driver = get_neo4j_driver()
        if driver:
            def _delete_graph_data(tx):
                # Delete all relationships for this paper
                tx.run(
                    "MATCH ()-[r:RELATED_TO {paper_id: $paper_id, user_id: $user_id}]->() "
                    "DELETE r",
                    paper_id=paper_id, user_id=user_id
                )
                # Delete any orphaned entity nodes (nodes with 0 relationships)
                tx.run(
                    "MATCH (e:Entity) "
                    "WHERE count{(e)--()} = 0 "
                    "DELETE e"
                )
            with driver.session() as session:
                await asyncio.to_thread(session.execute_write, _delete_graph_data)
            print(f"✅ Deleted graph data from Neo4j for paper {paper_id}")
    except Exception as e:
        print(f"⚠️ Failed to delete graph data from Neo4j for paper {paper_id}: {e}")

    # 4. Delete query history (MongoDB)
    try:
        await db.queries.delete_many({"user_id": user_id, "paper_id": paper_id})
        print(f"✅ Deleted query history for paper {paper_id}")
    except Exception as e:
        print(f"⚠️ Failed to delete query history for paper {paper_id}: {e}")

    # 5. Delete Cloudinary PDF
    if "cloudinary_public_id" in doc:
        try:
            await delete_pdf(doc["cloudinary_public_id"])
            print(f"✅ Deleted PDF from Cloudinary for paper {paper_id}")
        except Exception as e:
            print(f"⚠️ Failed to delete PDF from Cloudinary for paper {paper_id}: {e}")

    # 6. Delete MongoDB paper document (LAST)
    try:
        await db.papers.delete_one({"_id": oid})
        print(f"✅ Deleted paper document from MongoDB for paper {paper_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete paper document: {e}")

    return {"message": "Paper deleted successfully"}