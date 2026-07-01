from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db
from vectorstore.qdrant_client import init_qdrant
from services.graph_client import init_neo4j, close_neo4j
from routers import auth, papers, query, graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    init_qdrant()
    init_neo4j()
    yield
    await close_db()
    close_neo4j()


app = FastAPI(
    title="Structured Data Retrieval API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://researchai-frontend-cyan.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(papers.router)
app.include_router(query.router)
app.include_router(graph.router)


@app.get("/")
async def root():
    return {"message": "Structured Data Retrieval API", "version": "1.0.0"}