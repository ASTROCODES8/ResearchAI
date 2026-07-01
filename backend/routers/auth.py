from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Response, Cookie, status
from pydantic import BaseModel, EmailStr

from database import get_db
from services import user_service
from services.token_service import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    hash_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie config
ACCESS_MAX_AGE  = 15 * 60          # 15 minutes in seconds
REFRESH_MAX_AGE = 7 * 24 * 3600    # 7 days in seconds
COOKIE_KWARGS = dict(httponly=True, samesite="lax", secure=False)  # set secure=True in prod with HTTPS


# ─── request bodies ──────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─── helpers ─────────────────────────────────────────────────────────────────

def _set_auth_cookies(response: Response, user_id: str):
    access  = create_access_token(user_id)
    refresh = create_refresh_token(user_id)

    response.set_cookie("access_token",  access,  max_age=ACCESS_MAX_AGE,  **COOKIE_KWARGS)
    response.set_cookie("refresh_token", refresh, max_age=REFRESH_MAX_AGE, **COOKIE_KWARGS)

    return access, refresh


# ─── endpoints ───────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
async def signup(payload: SignupRequest, response: Response):
    try:
        user = await user_service.create_user(payload.email, payload.password, payload.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user_id = str(user["_id"])
    _set_auth_cookies(response, user_id)

    return {"id": user_id, "email": user["email"], "name": user["name"]}


@router.post("/login")
async def login(payload: LoginRequest, response: Response):
    try:
        user = await user_service.authenticate(payload.email, payload.password)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    _set_auth_cookies(response, user_id)

    return {"id": user_id, "email": user["email"], "name": user["name"]}


@router.post("/refresh")
async def refresh(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    user_id = verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Refresh token invalid or expired")

    # Issue new pair
    _set_auth_cookies(response, user_id)
    return {"message": "Tokens refreshed"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/me")
async def me(access_token: str = Cookie(None)):
    """Return current user info — used by frontend to rehydrate session."""
    from services.token_service import verify_access_token
    from services.user_service import get_user_by_id

    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = verify_access_token(access_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": str(user["_id"]), "email": user["email"], "name": user["name"]}
