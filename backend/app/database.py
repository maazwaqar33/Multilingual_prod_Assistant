# [Spec]: specs/database/schema.md
# TodoEvolve Backend - Database Connection

"""
Database connection and session management.
"""

from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager
from typing import Generator

from .config import get_settings

# Get database URL from settings
settings = get_settings()

# Create engine with connection pooling
# For SQLite (development), we need check_same_thread=False
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args=connect_args
)


def create_db_and_tables() -> None:
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Get a database session.
    
    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session


@contextmanager
def get_session_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    
    Usage:
        with get_session_context() as session:
            session.add(task)
            session.commit()
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
