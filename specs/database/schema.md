# Database Schema

## Overview
Using Neon Serverless PostgreSQL with SQLModel ORM.

## Tables

### users (managed by Better Auth)
Better Auth manages the users table on the frontend. We reference user_id from JWT tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | User identifier from Better Auth |

---

### tasks
Main tasks table for todo items.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | SERIAL | PRIMARY KEY | auto | Task identifier |
| user_id | VARCHAR(255) | NOT NULL, INDEX | - | Owner reference |
| title | VARCHAR(200) | NOT NULL | - | Task title |
| description | TEXT | NULLABLE | '' | Task description |
| completed | BOOLEAN | NOT NULL | false | Completion status |
| priority | VARCHAR(20) | NOT NULL | 'medium' | high/medium/low |
| tags | TEXT[] | NULLABLE | [] | Array of tag strings |
| created_at | TIMESTAMP | NOT NULL | NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | NOW() | Last update time |

**Indexes:**
- `idx_tasks_user_id` on `user_id`
- `idx_tasks_completed` on `completed`
- `idx_tasks_priority` on `priority`
- `idx_tasks_created_at` on `created_at`

---

## SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(max_length=200)
    description: str = Field(default="")
    completed: bool = Field(default=False, index=True)
    priority: str = Field(default="medium", index=True)
    tags: List[str] = Field(default=[], sa_column_kwargs={"type_": "TEXT[]"})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Migrations

Using Alembic for database migrations:

```bash
# Generate migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

---

## Connection

```python
from sqlmodel import create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
```
