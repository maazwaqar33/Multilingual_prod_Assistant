# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Authentication

"""
JWT authentication and user verification.
For development, supports mock user mode without tokens.
"""

from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional

from .config import get_settings

security = HTTPBearer(auto_error=False)


class AuthError(HTTPException):
    """Authentication error."""
    def __init__(self, detail: str = "Invalid or missing authentication token"):
        super().__init__(status_code=401, detail=detail)


class ForbiddenError(HTTPException):
    """Authorization error."""
    def __init__(self, detail: str = "You don't have permission to access this resource"):
        super().__init__(status_code=403, detail=detail)


def decode_token(token: str) -> dict:
    """
    Decode and validate JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        AuthError: If token is invalid
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=["HS256"]
        )
        return payload
    except JWTError as e:
        raise AuthError(f"Invalid token: {str(e)}")


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> str:
    """
    Extract and verify user from JWT token.
    In development mode, allows mock user without token.
    
    Args:
        credentials: HTTP Bearer credentials
        
    Returns:
        User ID from token or mock user ID in development
        
    Raises:
        AuthError: If no token or invalid token (production only)
    """
    settings = get_settings()
    
    # Removed mock user fallback - always require proper authentication
    # This fixes the bug where tasks were saved with user_123 but fetched with real user_id
    
    if credentials is None:
        raise AuthError("Missing authentication token")
    
    payload = decode_token(credentials.credentials)
    
    user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
    if not user_id:
        raise AuthError("Token missing user identifier")
    
    return user_id


def verify_user_access(current_user: str, user_id: str) -> None:
    """
    Verify the current user has access to the requested user's resources.
    
    Args:
        current_user: User ID from token
        user_id: User ID from request path
        
    Raises:
        ForbiddenError: If user doesn't have access
    """
    # Convert both to strings to handle type mismatches (int vs str)
    if str(current_user) != str(user_id):
        raise ForbiddenError("You cannot access another user's resources")
