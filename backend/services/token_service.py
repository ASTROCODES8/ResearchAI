import os
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

ACCESS_SECRET  = os.getenv("JWT_ACCESS_SECRET", "access_secret_fallback")
REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "refresh_secret_fallback")
ALGORITHM      = "HS256"

ACCESS_EXPIRE_MINUTES  = 15       # short-lived
REFRESH_EXPIRE_DAYS    = 7


# ─── token creation ──────────────────────────────────────────────────────────

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, ACCESS_SECRET, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, REFRESH_SECRET, algorithm=ALGORITHM)


# ─── token verification ──────────────────────────────────────────────────────

def verify_access_token(token: str) -> Optional[str]:
    """Returns user_id string or None."""
    try:
        payload = jwt.decode(token, ACCESS_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload.get("sub")
    except JWTError:
        return None


def verify_refresh_token(token: str) -> Optional[str]:
    """Returns user_id string or None."""
    try:
        payload = jwt.decode(token, REFRESH_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload.get("sub")
    except JWTError:
        return None


# ─── hashing for DB storage ──────────────────────────────────────────────────

def hash_token(token: str) -> str:
    """SHA-256 hash — store this in DB, not the raw token."""
    return hashlib.sha256(token.encode()).hexdigest()
