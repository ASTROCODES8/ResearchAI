"""
MongoDB document schemas (Pydantic models used for validation + serialisation).

Collections
───────────
users
  _id          : ObjectId  (auto)
  email        : str       unique
  name         : str
  password_hash: str
  created_at   : datetime

papers
  _id          : ObjectId  (auto)
  user_id      : str       (ObjectId as string)
  title        : str
  authors      : List[str]
  published_date: str      (extracted from paper, may be partial)
  overview     : str       (brief summary paragraph)
  pdf_url      : str       (Cloudinary secure URL)
  cloudinary_public_id : str   (for deletion if needed later)
  created_at   : datetime

refresh_tokens
  _id          : ObjectId  (auto)
  user_id      : str
  token        : str       unique  (hashed refresh token)
  expires_at   : datetime
  created_at   : datetime
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


# ─── helpers ────────────────────────────────────────────────────────────────

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ─── User ────────────────────────────────────────────────────────────────────

class UserInDB(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    email: EmailStr
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class UserOut(BaseModel):
    id: str
    email: str
    name: str


# ─── Paper ───────────────────────────────────────────────────────────────────

class PaperSummary(BaseModel):
    title: str
    authors: List[str]
    published_date: str
    overview: str


class PaperInDB(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: str
    title: str
    authors: List[str]
    published_date: str
    overview: str
    pdf_url: str
    cloudinary_public_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class PaperOut(BaseModel):
    id: str
    user_id: str
    title: str
    authors: List[str]
    published_date: str
    overview: str
    pdf_url: str
    created_at: datetime

    class Config:
        populate_by_name = True
