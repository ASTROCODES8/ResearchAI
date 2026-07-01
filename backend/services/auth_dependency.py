from fastapi import Cookie, HTTPException, status
from typing import Optional
from services.token_service import verify_access_token


async def get_current_user(access_token: Optional[str] = Cookie(None)) -> str:
    """
    FastAPI dependency.
    Reads the httpOnly `access_token` cookie and returns the user_id.
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    user_id = verify_access_token(access_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token invalid or expired",
        )
    return user_id
