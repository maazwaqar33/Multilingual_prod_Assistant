# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Task Routes

"""
Task CRUD API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime

from ..database import get_session
from ..models import Task
from ..schemas import (
    TaskCreate, 
    TaskUpdate, 
    TaskResponse, 
    TaskListResponse, 
    TaskToggleResponse
)
from ..auth import get_current_user, verify_user_access
from ..dapr_client import dapr_client
from ..dapr_client import dapr_client

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


def get_task_or_404(
    session: Session, 
    task_id: int, 
    user_id: str
) -> Task:
    """Get task by ID or raise 404."""
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status: Optional[str] = Query(None, pattern="^(all|pending|completed)$"),
    priority: Optional[str] = Query(None, pattern="^(high|medium|low)$"),
    sort: str = Query("created_desc", pattern="^(created_asc|created_desc|priority|title)$"),
    search: Optional[str] = Query(None),
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> TaskListResponse:
    """
    List all tasks for authenticated user.
    
    Supports filtering by status, priority, and search.
    Supports sorting by created date, priority, or title.
    """
    verify_user_access(current_user, user_id)
    
    import logging
    logger = logging.getLogger(__name__)
    try:
        # Build query
        statement = select(Task).where(Task.user_id == user_id)
        
        # Apply filters
        if status == "pending":
            statement = statement.where(Task.completed == False)
        elif status == "completed":
            statement = statement.where(Task.completed == True)
        
        if priority:
            statement = statement.where(Task.priority == priority)
        
        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                Task.title.ilike(search_pattern) | 
                Task.description.ilike(search_pattern)
            )
        
        # Apply sorting
        if sort == "created_asc":
            statement = statement.order_by(Task.created_at.asc())
        elif sort == "created_desc":
            statement = statement.order_by(Task.created_at.desc())
        elif sort == "priority":
            # Custom order: high > medium > low
            statement = statement.order_by(Task.priority.desc())
        elif sort == "title":
            statement = statement.order_by(Task.title.asc())
        
        tasks = session.exec(statement).all()
        
        return TaskListResponse(
            tasks=[TaskResponse.model_validate(t) for t in tasks],
            total=len(tasks)
        )
    except Exception as e:
        logger.error(f"Error in list_tasks: {e}", exc_info=True)
        print(f"CRITICAL ERROR IN LIST_TASKS: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """Create a new task."""
    verify_user_access(current_user, user_id)
    
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        tags=task_data.tags
    )
    
    session.add(task)
    session.commit()
    session.refresh(task)
    
    # Publish event
    dapr_client.publish_event("task.created", task.model_dump(mode='json'))
    
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """Get a single task by ID."""
    verify_user_access(current_user, user_id)
    task = get_task_or_404(session, task_id, user_id)
    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """Update an existing task."""
    verify_user_access(current_user, user_id)
    task = get_task_or_404(session, task_id, user_id)
    
    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    task.mark_updated()
    session.add(task)
    session.commit()
    session.refresh(task)
    
    # Publish event
    dapr_client.publish_event("task.updated", task.model_dump(mode='json'))
    
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> None:
    """Delete a task."""
    verify_user_access(current_user, user_id)
    task = get_task_or_404(session, task_id, user_id)
    
    session.delete(task)
    session.commit()
    
    # Publish event
    dapr_client.publish_event("task.deleted", {"id": task_id, "user_id": user_id})
    
    # Publish event
    dapr_client.publish_event("task.deleted", {"id": task_id, "user_id": user_id})


@router.patch("/{task_id}/complete", response_model=TaskToggleResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> TaskToggleResponse:
    """Toggle task completion status."""
    verify_user_access(current_user, user_id)
    task = get_task_or_404(session, task_id, user_id)
    
    task.completed = not task.completed
    task.mark_updated()
    session.add(task)
    session.commit()
    
    # Publish event
    dapr_client.publish_event("task.updated", task.model_dump(mode='json'))
    
    status = "completed" if task.completed else "pending"
    return TaskToggleResponse(
        id=task.id,
        completed=task.completed,
        message=f"Task marked as {status}"
    )
