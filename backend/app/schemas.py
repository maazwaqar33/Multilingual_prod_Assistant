# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Pydantic Schemas

"""
Request and response schemas for API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# --- Task Schemas ---

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)
    priority: str = Field(default="medium", pattern="^(high|medium|low)$")
    tags: List[str] = Field(default=[])
    due_date: Optional[datetime] = Field(default=None)


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """Schema for task response."""
    id: int
    user_id: str
    title: str
    description: str
    completed: bool
    priority: str
    tags: List[str]
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for listing tasks."""
    tasks: List[TaskResponse]
    total: int


class TaskToggleResponse(BaseModel):
    """Schema for toggle completion response."""
    id: int
    completed: bool
    message: str


# --- Health Schemas ---

class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str
    version: str


# --- Error Schemas ---

class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str


class ChatMessageResponse(BaseModel):
    """Schema for chat message response."""
    id: int
    role: str
    content: str
    tool_calls: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
