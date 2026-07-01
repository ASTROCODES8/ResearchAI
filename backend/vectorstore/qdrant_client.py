import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PayloadSchemaType,
)

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

COLLECTION_NAME = "research_papers"
VECTOR_SIZE = 3072  # Gemini embedding dimension

_client: QdrantClient = None


def init_qdrant():
    global _client

    if not QDRANT_URL or not QDRANT_API_KEY:
        raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set in .env")

    _client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
    )

    # Create collection if it doesn't exist
    existing = [c.name for c in _client.get_collections().collections]

    if COLLECTION_NAME not in existing:
        _client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )
        print(f"✅ Qdrant collection '{COLLECTION_NAME}' created")
    else:
        count = _client.count(collection_name=COLLECTION_NAME).count
        print(f"✅ Qdrant ready — collection '{COLLECTION_NAME}' has {count} vectors")

    # Create payload indexes for filtering (user_id) and deletion (paper_id)
    for field in ("user_id", "paper_id"):
        try:
            _client.create_payload_index(
                collection_name=COLLECTION_NAME,
                field_name=field,
                field_schema=PayloadSchemaType.KEYWORD,
            )
            print(f"✅ Payload index created for '{field}'")
        except Exception:
            # Index already exists — safe to ignore
            pass


def get_qdrant_client() -> QdrantClient:
    return _client


def get_collection_name() -> str:
    return COLLECTION_NAME