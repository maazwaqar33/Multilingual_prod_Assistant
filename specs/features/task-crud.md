# Feature: Task CRUD Operations

## Phase
Phase I: Console App (Basic Level)

## User Stories

### US-001: Add Task
**As a** user  
**I want to** add a new task with title and description  
**So that** I can track things I need to do

### US-002: View Tasks
**As a** user  
**I want to** see all my tasks in a list  
**So that** I can review what needs to be done

### US-003: Update Task
**As a** user  
**I want to** modify an existing task's details  
**So that** I can correct or update information

### US-004: Delete Task
**As a** user  
**I want to** remove a task from my list  
**So that** I can clean up completed or cancelled items

### US-005: Mark Complete
**As a** user  
**I want to** toggle a task's completion status  
**So that** I can track my progress

---

## Acceptance Criteria

### Add Task
- [x] Title is required (1-200 characters)
- [x] Description is optional (max 1000 characters)
- [x] Task gets a unique auto-incremented ID
- [x] Task starts with completed = false
- [x] System confirms successful creation

### View Tasks
- [x] Display all tasks with ID, title, status
- [x] Show `[ ]` for incomplete, `[x]` for complete
- [x] Handle empty list gracefully ("No tasks yet")
- [x] Tasks displayed in order of creation

### Update Task
- [x] User provides task ID
- [x] Can update title, description, or both
- [x] Validates task exists before update
- [x] Returns error if task not found
- [x] Confirms successful update

### Delete Task
- [x] User provides task ID
- [x] Validates task exists before deletion
- [x] Returns error if task not found
- [x] Confirms successful deletion
- [x] Task is permanently removed

### Mark Complete
- [x] User provides task ID
- [x] Toggles current completion status
- [x] Returns new status after toggle
- [x] Validates task exists
- [x] Returns error if task not found

---

## Data Model

```python
class Task:
    id: int              # Auto-incremented unique ID
    title: str           # Required, 1-200 chars
    description: str     # Optional, max 1000 chars
    completed: bool      # Default: False
    created_at: datetime # Auto-set on creation
```

---

## Interface (Console App)

```
=== TodoEvolve - Smart Productivity Assistant ===

1. Add Task
2. View Tasks
3. Delete Task
4. Update Task
5. Toggle Complete
6. Exit

Enter choice: _
```

---

## Error Handling

| Error | Message |
|-------|---------|
| Empty title | "Error: Title is required" |
| Task not found | "Error: Task with ID {id} not found" |
| Invalid choice | "Error: Please enter a valid option (1-6)" |
| Invalid ID | "Error: Please enter a valid task ID" |
