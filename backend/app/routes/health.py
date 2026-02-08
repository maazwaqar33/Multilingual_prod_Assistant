# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Health Routes

"""
Health check endpoint.
"""

from fastapi import APIRouter
from ..schemas import HealthResponse
from ..config import get_settings

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Check if the API is running.
    
    Returns:
        HealthResponse with status and version
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version
    )
