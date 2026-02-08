# REST API Endpoints

## Base URL
- Development: `http://localhost:8000`
- Production: Hugging Face Spaces URL

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### Tasks

#### GET /api/{user_id}/tasks
List all tasks for authenticated user.

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | string | No | "all" | Filter: "all", "pending", "completed" |
| priority | string | No | null | Filter: "high", "medium", "low" |
| sort | string | No | "created_desc" | Sort: "created_asc", "created_desc", "priority", "title" |
| search | string | No | null | Search in title/description |

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "priority": "medium",
      "tags": ["shopping"],
      "created_at": "2025-12-14T10:00:00Z",
      "updated_at": "2025-12-14T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

#### POST /api/{user_id}/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "medium",
  "tags": ["shopping"]
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "priority": "medium",
  "tags": ["shopping"],
  "created_at": "2025-12-14T10:00:00Z",
  "updated_at": "2025-12-14T10:00:00Z"
}
```

---

#### GET /api/{user_id}/tasks/{id}
Get a single task by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "priority": "medium",
  "tags": ["shopping"],
  "created_at": "2025-12-14T10:00:00Z",
  "updated_at": "2025-12-14T10:00:00Z"
}
```

---

#### PUT /api/{user_id}/tasks/{id}
Update a task.

**Request Body:** (all fields optional)
```json
{
  "title": "Buy groceries and fruits",
  "description": "Updated description",
  "priority": "high",
  "tags": ["shopping", "urgent"]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Buy groceries and fruits",
  "description": "Updated description",
  "completed": false,
  "priority": "high",
  "tags": ["shopping", "urgent"],
  "created_at": "2025-12-14T10:00:00Z",
  "updated_at": "2025-12-14T10:30:00Z"
}
```

---

#### DELETE /api/{user_id}/tasks/{id}
Delete a task.

**Response:** (204 No Content)

---

#### PATCH /api/{user_id}/tasks/{id}/complete
Toggle task completion status.

**Response:**
```json
{
  "id": 1,
  "completed": true,
  "message": "Task marked as completed"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Title is required"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "detail": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "An unexpected error occurred"
}
```
