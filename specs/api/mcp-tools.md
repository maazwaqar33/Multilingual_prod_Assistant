# MCP Tools Specification

## Interface
All tools follow the Model Context Protocol (MCP) standard.

## Tool Definitions

### `add_task`
Creates a task in the user's list.
```json
{
  "name": "add_task",
  "description": "Create a new task",
  "input_schema": {
    "type": "object",
    "properties": {
      "title": { "type": "string", "description": "Task title" },
      "priority": { "type": "string", "enum": ["high", "medium", "low"] },
      "tags": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["title"]
  }
}
```

### `list_tasks`
Retrieves tasks from the database.
```json
{
  "name": "list_tasks",
  "description": "List current tasks",
  "input_schema": {
    "type": "object",
    "properties": {
      "status": { "type": "string", "enum": ["all", "pending", "completed"] },
      "limit": { "type": "integer", "default": 20 }
    }
  }
}
```

### `suggest_priority` (Bonus: Reusable Intelligence)
Analyzes task content to suggest priority.
- **Logic**: 
  - "Urgent", "Today", "ASAP" -> `high`
  - "Next week", "Eventually" -> `low`
  - Default -> `medium`

### `detect_language` (Bonus: Multilingual)
Identifies input language.
- **Output**: `en` or `ur`
- **Action**: Adjusts system prompt language for response.
