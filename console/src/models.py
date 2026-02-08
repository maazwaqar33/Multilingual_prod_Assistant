# [Spec]: specs/features/task-crud.md
# TodoEvolve Console App - Models

"""
Task model for TodoEvolve application.
Implements US-001 through US-005 data requirements.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """
    Represents a single task in the TodoEvolve system.
    
    Attributes:
        id: Auto-incremented unique identifier
        title: Required task title (1-200 characters)
        description: Optional task description (max 1000 characters)
        completed: Task completion status (default: False)
        created_at: Timestamp of task creation
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self) -> None:
        """Validate task data after initialization."""
        self._validate_title()
        self._validate_description()
    
    def _validate_title(self) -> None:
        """Ensure title meets requirements."""
        if not self.title or not self.title.strip():
            raise ValueError("Error: Title is required")
        if len(self.title) > 200:
            raise ValueError("Error: Title must be 200 characters or less")
    
    def _validate_description(self) -> None:
        """Ensure description meets requirements."""
        if len(self.description) > 1000:
            raise ValueError("Error: Description must be 1000 characters or less")
    
    def toggle_complete(self) -> bool:
        """
        Toggle the completion status of the task.
        
        Returns:
            The new completion status after toggling.
        """
        self.completed = not self.completed
        return self.completed
    
    def update(self, title: Optional[str] = None, description: Optional[str] = None) -> None:
        """
        Update task properties.
        
        Args:
            title: New title (optional)
            description: New description (optional)
        """
        if title is not None:
            self.title = title
            self._validate_title()
        if description is not None:
            self.description = description
            self._validate_description()
    
    def __str__(self) -> str:
        """String representation for display."""
        status = "[x]" if self.completed else "[ ]"
        return f"{self.id}. {status} {self.title}"
    
    def to_dict(self) -> dict:
        """Convert task to dictionary for serialization."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat()
        }
