import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client["sdr"]
    # Indexes for fast lookups
    await db.users.create_index("email", unique=True)
    await db.papers.create_index("user_id")
    await db.papers.create_index([("user_id", 1), ("created_at", -1)])
    # refresh token lookup
    await db.refresh_tokens.create_index("token", unique=True)
    await db.refresh_tokens.create_index("user_id")
    await db.query_history.create_index([("user_id", 1), ("created_at", -1)])
    print("✅  MongoDB connected — indexes ensured")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
