# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Main Application

"""
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import create_db_and_tables
from app.routes import health, tasks, chat, auth

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("TodoEvolve API starting...")
    create_db_and_tables()
    print("Database tables created")
    
    # Check SMTP configuration
    if not settings.smtp_user:
        print("WARNING: SMTP_USER not set in .env. Email features (Forgot Password, Verify) will simulate sending only.")
    else:
        print(f"SMTP Mode: Enabled (sending as {settings.smtp_user})")
        
    yield
    # Shutdown
    print("TodoEvolve API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="TodoEvolve API",
    description="Smart Multilingual Productivity Assistant - Backend API",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Mount static files
# Mount static files
from fastapi.staticfiles import StaticFiles
import os

static_dir = "/app/static"
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "TodoEvolve API",
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "disabled",
        "health": "/health"
    }


# For running with uvicorn directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
