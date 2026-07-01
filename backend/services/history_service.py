from datetime import datetime, timezone
from database import get_db


async def save_query(user_id: str, question: str, answer: str, sources: list):
    db = get_db()
    doc = {
        "user_id":    user_id,
        "question":   question,
        "answer":     answer,
        "sources":    sources,
        "created_at": datetime.now(timezone.utc),
    }
    await db.query_history.insert_one(doc)


async def get_query_history(user_id: str) -> list:
    db = get_db()
    cursor = db.query_history.find(
        {"user_id": user_id}
    ).sort("created_at", -1)

    history = []
    async for doc in cursor:
        history.append({
            "id":         str(doc["_id"]),
            "question":   doc["question"],
            "answer":     doc["answer"],
            "sources":    doc["sources"],
            "created_at": doc["created_at"].isoformat(),
        })
    return history