# Feature: AI Chatbot

## Phase
Phase III: AI-Powered Todo Chatbot

## User Stories

### US-301: Natural Language Task Management
**As a** user
**I want to** add, list, and update tasks using natural language
**So that** I can manage my todos conversationally without navigating UI forms

### US-302: Voice Commands
**As a** user
**I want to** speak my tasks instead of typing
**So that** I can add items quickly while on the go

### US-303: Smart Priority Suggestions
**As a** user
**I want to** get AI suggestions for task priority
**So that** I can better organize my workload

### US-304: Multilingual Support (Urdu)
**As a** user
**I want to** interact with the bot in Urdu
**So that** I can use the tool in my native language

## System Prompts

### Core System Prompt
```
You are TodoEvolve, a smart productivity assistant.
Your goal is to help users manage their tasks efficiently.
You have access to a set of tools to read and modify the user's task list.

Capabilities:
- Manage tasks (add, update, delete, list, complete)
- Detect language (English/Urdu) and respond in the same language
- Suggest priorities based on task urgency and context
- Be concise and helpful

Constraints:
- Always check the current date/time when checking for due dates
- If a task is ambiguous, ask clarifying questions
- Prioritize user's explicit instructions over AI suggestions
```

## MCP Tools (spec)

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `add_task` | Create a new task | `title`, `description` (opt), `priority` (opt), `tags` (opt) |
| `list_tasks` | Get tasks with optional filters | `status`, `priority`, `limit` |
| `update_task` | Update an existing task | `task_id`, `title`, `priority` |
| `delete_task` | Remove a task | `task_id` |
| `complete_task` | Mark task as done | `task_id` |

## Technical Architecture

- **Provider**: Gemini API (via LangChain/MCP)
- **Interface**: Chat interface in Next.js (ChatKit style)
- **Voice**: Web Speech API for STT (Speech-to-Text)
- **Context**: Last 10 messages + System Prompt
