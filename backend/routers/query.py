from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.auth_dependency import get_current_user
from services.query_service import answer_question
from services.history_service import save_query, get_query_history

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    question: str


@router.post("/")
async def query_papers(
    body: QueryRequest,
    user_id: str = Depends(get_current_user),
):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        result = await answer_question(
            question=body.question,
            user_id=user_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {e}")

    await save_query(
        user_id=user_id,
        question=body.question,
        answer=result["answer"],
        sources=result["sources"],
    )

    return {
        "question": body.question,
        "answer":   result["answer"],
        "sources":  result["sources"],
        "graph_facts": result.get("graph_facts", [])
    }


@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    history = await get_query_history(user_id)
    return {"history": history, "total": len(history)}