# [Spec]: specs/database/schema.md
# TodoEvolve Backend - SQLModel Models

"""
Database models using SQLModel.
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional, List
from datetime import datetime


class Task(SQLModel, table=True):
    """
    Task model for todo items.
    
    Implements the task schema with support for:
    - Basic fields: title, description, completed
    - Organization: priority, tags
    - Timestamps: created_at, updated_at
    """
    __tablename__ = "tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, description="Owner of the task")
    
    # Core fields
    title: str = Field(max_length=200, description="Task title")
    description: str = Field(default="", description="Task description")
    completed: bool = Field(default=False, index=True, description="Completion status")
    
    # Organization
    priority: str = Field(default="medium", index=True, description="Priority: high/medium/low")
    tags: List[str] = Field(
        default=[],
        sa_column=Column(JSON),
        description="List of tags"
    )
    
    # Recurring Tasks (Phase V)
    is_recurring: bool = Field(default=False, description="Whether the task is recurring")
    recurrence_interval: Optional[str] = Field(default=None, description="Interval for recurring tasks (e.g., daily, weekly, monthly)")
    
    # Due Date & Reminders
    due_date: Optional[datetime] = Field(default=None, index=True, description="Task deadline")
    
    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )
    
    def mark_updated(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = datetime.utcnow()


class User(SQLModel, table=True):
    """
    User model for authentication.
    
    Implements secure user storage with:
    - Email (unique, indexed)
    - Bcrypt hashed password
    - Account status tracking
    - Profile picture (optional)
    """
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255, description="User email")
    hashed_password: str = Field(description="Bcrypt hashed password")
    
    # Profile
    profile_picture: Optional[str] = Field(default=None, max_length=500, description="URL to profile picture")
    
    # Account status
    is_active: bool = Field(default=True, description="Account active status")
    is_verified: bool = Field(default=False, description="Email verified status")
    
    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
    last_login: Optional[datetime] = Field(
        default=None,
        description="Last successful login timestamp"
    )


class RefreshToken(SQLModel, table=True):
    """
    Refresh token model for session management.
    
    Implements secure token storage with:
    - Token hash (not plain text)
    - Expiration tracking
    - Revocation capability
    """
    __tablename__ = "refresh_tokens"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, description="Owner user")
    token_hash: str = Field(description="SHA256 hash of the refresh token")
    
    # Expiration and revocation
    expires_at: datetime = Field(description="Token expiration timestamp")
    is_revoked: bool = Field(default=False, description="Token revocation status")
    
    # Metadata
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Token creation timestamp"
    )
    user_agent: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Device/browser info for session tracking"
    )


class ChatMessage(SQLModel, table=True):
    """
    Chat message model for persistent history.
    Stores both user and assistant messages for context retention.
    """
    __tablename__ = "chat_messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, description="User ID")
    role: str = Field(description="Message role (user/assistant)")
    content: str = Field(description="Message content")
    
    # Metadata
    tool_calls: Optional[str] = Field(default=None, description="JSON string of tool calls if any")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )


class PasswordResetToken(SQLModel, table=True):
    """
    Password reset token model for persistent forgot-password flow.
    """
    __tablename__ = "password_reset_tokens"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, description="Owner user")
    token_hash: str = Field(description="SHA256 hash of the reset token")
    
    expires_at: datetime = Field(description="Token expiration timestamp")
    is_used: bool = Field(default=False, description="Whether token has been used")
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Token creation timestamp"
    )


class EmailVerificationToken(SQLModel, table=True):
    """
    Email verification token model.
    Store tokens for account activation.
    """
    __tablename__ = "email_verification_tokens"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, description="Owner user")
    token_hash: str = Field(description="SHA256 hash of the verification token")
    
    expires_at: datetime = Field(description="Token expiration timestamp (24h)")
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Token creation timestamp"
    )
