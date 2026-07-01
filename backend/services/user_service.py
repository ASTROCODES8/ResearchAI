from datetime import datetime, timezone
from typing import Optional
from passlib.context import CryptContext
from bson import ObjectId
from database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


async def create_user(email: str, password: str, name: str) -> dict:
    db = get_db()
    existing = await db.users.find_one({"email": email.lower()})
    if existing:
        raise ValueError("Email already registered")

    doc = {
        "email":         email.lower(),
        "name":          name,
        "password_hash": hash_password(password),
        "created_at":    datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def authenticate(email: str, password: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": email.lower()})
    if not user or not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials")
    return user


async def get_user_by_id(user_id: str) -> Optional[dict]:
    db = get_db()
    return await db.users.find_one({"_id": ObjectId(user_id)})
