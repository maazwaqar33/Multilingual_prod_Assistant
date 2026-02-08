# [Spec]: specs/features/task-crud.md
# TodoEvolve Console App - Tests

"""
Unit tests for TaskManager functionality.
Tests all CRUD operations and edge cases.
"""

import pytest
from src.models import Task
from src.task_manager import TaskManager, TaskNotFoundError


class TestTask:
    """Tests for Task model."""
    
    def test_create_task_with_title(self):
        """Task can be created with just a title."""
        task = Task(id=1, title="Test Task")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == ""
        assert task.completed is False
    
    def test_create_task_with_description(self):
        """Task can be created with title and description."""
        task = Task(id=1, title="Test", description="Description")
        assert task.description == "Description"
    
    def test_task_requires_title(self):
        """Task creation fails with empty title."""
        with pytest.raises(ValueError, match="Title is required"):
            Task(id=1, title="")
    
    def test_task_title_max_length(self):
        """Task title cannot exceed 200 characters."""
        with pytest.raises(ValueError, match="200 characters"):
            Task(id=1, title="x" * 201)
    
    def test_task_description_max_length(self):
        """Task description cannot exceed 1000 characters."""
        with pytest.raises(ValueError, match="1000 characters"):
            Task(id=1, title="Test", description="x" * 1001)
    
    def test_toggle_complete(self):
        """Toggle changes completion status."""
        task = Task(id=1, title="Test")
        assert task.completed is False
        
        result = task.toggle_complete()
        assert result is True
        assert task.completed is True
        
        result = task.toggle_complete()
        assert result is False
        assert task.completed is False
    
    def test_update_title(self):
        """Task title can be updated."""
        task = Task(id=1, title="Original")
        task.update(title="Updated")
        assert task.title == "Updated"
    
    def test_update_description(self):
        """Task description can be updated."""
        task = Task(id=1, title="Test")
        task.update(description="New description")
        assert task.description == "New description"
    
    def test_str_representation(self):
        """String representation includes status and title."""
        task = Task(id=1, title="Test")
        assert "[ ]" in str(task)
        assert "Test" in str(task)
        
        task.toggle_complete()
        assert "[x]" in str(task)


class TestTaskManager:
    """Tests for TaskManager class."""
    
    @pytest.fixture
    def manager(self):
        """Create a fresh TaskManager for each test."""
        return TaskManager()
    
    def test_add_task(self, manager):
        """Add task returns new task with ID."""
        task = manager.add_task("New Task")
        assert task.id == 1
        assert task.title == "New Task"
        assert manager.count() == 1
    
    def test_add_multiple_tasks(self, manager):
        """Each task gets unique incremented ID."""
        task1 = manager.add_task("Task 1")
        task2 = manager.add_task("Task 2")
        task3 = manager.add_task("Task 3")
        
        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3
        assert manager.count() == 3
    
    def test_get_task(self, manager):
        """Can retrieve task by ID."""
        created = manager.add_task("Test")
        retrieved = manager.get_task(created.id)
        assert retrieved.title == "Test"
    
    def test_get_nonexistent_task(self, manager):
        """Getting nonexistent task raises error."""
        with pytest.raises(TaskNotFoundError):
            manager.get_task(999)
    
    def test_list_tasks_empty(self, manager):
        """List returns empty list when no tasks."""
        assert manager.list_tasks() == []
    
    def test_list_tasks_all(self, manager):
        """List returns all tasks."""
        manager.add_task("Task 1")
        manager.add_task("Task 2")
        tasks = manager.list_tasks()
        assert len(tasks) == 2
    
    def test_list_tasks_filter_completed(self, manager):
        """Can filter by completed status."""
        t1 = manager.add_task("Task 1")
        manager.add_task("Task 2")
        manager.toggle_complete(t1.id)
        
        completed = manager.list_tasks(status_filter="completed")
        assert len(completed) == 1
        assert completed[0].title == "Task 1"
    
    def test_list_tasks_filter_pending(self, manager):
        """Can filter by pending status."""
        t1 = manager.add_task("Task 1")
        manager.add_task("Task 2")
        manager.toggle_complete(t1.id)
        
        pending = manager.list_tasks(status_filter="pending")
        assert len(pending) == 1
        assert pending[0].title == "Task 2"
    
    def test_update_task(self, manager):
        """Can update task title and description."""
        task = manager.add_task("Original", "Old desc")
        manager.update_task(task.id, title="Updated", description="New desc")
        
        updated = manager.get_task(task.id)
        assert updated.title == "Updated"
        assert updated.description == "New desc"
    
    def test_update_nonexistent_task(self, manager):
        """Updating nonexistent task raises error."""
        with pytest.raises(TaskNotFoundError):
            manager.update_task(999, title="New")
    
    def test_delete_task(self, manager):
        """Delete removes task from storage."""
        task = manager.add_task("To Delete")
        assert manager.count() == 1
        
        deleted = manager.delete_task(task.id)
        assert deleted.title == "To Delete"
        assert manager.count() == 0
    
    def test_delete_nonexistent_task(self, manager):
        """Deleting nonexistent task raises error."""
        with pytest.raises(TaskNotFoundError):
            manager.delete_task(999)
    
    def test_toggle_complete(self, manager):
        """Toggle changes and returns status."""
        task = manager.add_task("Test")
        assert task.completed is False
        
        toggled = manager.toggle_complete(task.id)
        assert toggled.completed is True
    
    def test_count_methods(self, manager):
        """Count methods return correct values."""
        t1 = manager.add_task("Task 1")
        manager.add_task("Task 2")
        manager.add_task("Task 3")
        manager.toggle_complete(t1.id)
        
        assert manager.count() == 3
        assert manager.count_completed() == 1
        assert manager.count_pending() == 2
