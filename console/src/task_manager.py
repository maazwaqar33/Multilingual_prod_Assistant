# [Spec]: specs/features/task-crud.md
# TodoEvolve Console App - Task Manager

"""
TaskManager handles all CRUD operations for tasks.
Implements in-memory storage as per Phase I requirements.
"""

from typing import Dict, List, Optional
from .models import Task


class TaskNotFoundError(Exception):
    """Raised when a task with the given ID is not found."""
    pass


class TaskManager:
    """
    Manages task operations with in-memory storage.
    
    This class implements all Basic Level features:
    - Add Task (US-001)
    - View Tasks (US-002)
    - Update Task (US-003)
    - Delete Task (US-004)
    - Mark Complete (US-005)
    """
    
    def __init__(self) -> None:
        """Initialize the task manager with empty storage."""
        self._tasks: Dict[int, Task] = {}
        self._next_id: int = 1
    
    def add_task(self, title: str, description: str = "") -> Task:
        """
        Create a new task.
        
        Args:
            title: Task title (required, 1-200 chars)
            description: Task description (optional, max 1000 chars)
        
        Returns:
            The newly created Task object.
        
        Raises:
            ValueError: If title is empty or too long.
        """
        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description.strip()
        )
        self._tasks[task.id] = task
        self._next_id += 1
        return task
    
    def get_task(self, task_id: int) -> Task:
        """
        Retrieve a task by ID.
        
        Args:
            task_id: The unique task identifier.
        
        Returns:
            The Task object.
        
        Raises:
            TaskNotFoundError: If task with given ID doesn't exist.
        """
        if task_id not in self._tasks:
            raise TaskNotFoundError(f"Error: Task with ID {task_id} not found")
        return self._tasks[task_id]
    
    def list_tasks(self, status_filter: Optional[str] = None) -> List[Task]:
        """
        Get all tasks, optionally filtered by status.
        
        Args:
            status_filter: 'completed', 'pending', or None for all.
        
        Returns:
            List of Task objects matching the filter.
        """
        tasks = list(self._tasks.values())
        
        if status_filter == "completed":
            tasks = [t for t in tasks if t.completed]
        elif status_filter == "pending":
            tasks = [t for t in tasks if not t.completed]
        
        return sorted(tasks, key=lambda t: t.id)
    
    def update_task(
        self, 
        task_id: int, 
        title: Optional[str] = None, 
        description: Optional[str] = None
    ) -> Task:
        """
        Update an existing task.
        
        Args:
            task_id: The task ID to update.
            title: New title (optional).
            description: New description (optional).
        
        Returns:
            The updated Task object.
        
        Raises:
            TaskNotFoundError: If task doesn't exist.
            ValueError: If new title is invalid.
        """
        task = self.get_task(task_id)
        task.update(
            title=title.strip() if title else None,
            description=description.strip() if description else None
        )
        return task
    
    def delete_task(self, task_id: int) -> Task:
        """
        Delete a task by ID.
        
        Args:
            task_id: The task ID to delete.
        
        Returns:
            The deleted Task object.
        
        Raises:
            TaskNotFoundError: If task doesn't exist.
        """
        task = self.get_task(task_id)
        del self._tasks[task_id]
        return task
    
    def toggle_complete(self, task_id: int) -> Task:
        """
        Toggle the completion status of a task.
        
        Args:
            task_id: The task ID to toggle.
        
        Returns:
            The updated Task object.
        
        Raises:
            TaskNotFoundError: If task doesn't exist.
        """
        task = self.get_task(task_id)
        task.toggle_complete()
        return task
    
    def count(self) -> int:
        """Return the total number of tasks."""
        return len(self._tasks)
    
    def count_completed(self) -> int:
        """Return the number of completed tasks."""
        return sum(1 for t in self._tasks.values() if t.completed)
    
    def count_pending(self) -> int:
        """Return the number of pending tasks."""
        return sum(1 for t in self._tasks.values() if not t.completed)
