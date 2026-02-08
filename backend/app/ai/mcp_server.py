from typing import Any, List, Optional
from mcp.server import Server
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource
from sqlmodel import Session, select, col
from app.database import engine
from app.models import Task
from app.config import get_settings
import json

# Initialize MCP Server
app_mcp = Server("todo-evolve-mcp")


@app_mcp.list_tools()
async def list_tools() -> List[Tool]:
    return [
        Tool(
            name="add_task",
            description="Create a new task",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": { "type": "string", "description": "Task title" },
                    "description": { "type": "string", "description": "Task description" },
                    "priority": { "type": "string", "enum": ["high", "medium", "low"] },
                    "tags": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List current tasks",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": { "type": "string", "enum": ["all", "pending", "completed"] },
                    "limit": { "type": "integer", "default": 20 }
                }
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as complete or incomplete",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": { "type": "integer", "description": "ID of task to toggle" },
                    "completed": { "type": "boolean", "description": "True to mark complete, False for incomplete" }
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="bulk_complete_tasks",
            description="Mark multiple tasks as complete or incomplete",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_ids": { "type": "array", "items": { "type": "integer" }, "description": "List of task IDs" },
                    "completed": { "type": "boolean", "description": "True to mark complete, False to mark incomplete" }
                },
                "required": ["task_ids"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task by ID or title",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": { "type": "integer", "description": "ID of task to delete" },
                    "title": { "type": "string", "description": "Title of task to delete (fuzzy match)" }
                }
            }
        ),
        Tool(
            name="bulk_delete_tasks",
            description="Delete multiple tasks by ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_ids": { "type": "array", "items": { "type": "integer" }, "description": "List of task IDs to delete" }
                },
                "required": ["task_ids"]
            }
        ),
        Tool(
            name="update_task",
            description="Update a task's title, description, or priority",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": { "type": "integer", "description": "ID of task to update" },
                    "title": { "type": "string", "description": "New title" },
                    "description": { "type": "string", "description": "New description" },
                    "priority": { "type": "string", "enum": ["high", "medium", "low"] }
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="get_weather",
            description="Get current weather for a city",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": { "type": "string", "description": "City name (e.g. Karachi, London)" }
                },
                "required": ["city"]
            }
        ),
        Tool(
            name="plan_day",
            description="Intelligently plan the day and create multiple tasks based on user request",
            inputSchema={
                "type": "object",
                "properties": {
                    "request": { "type": "string", "description": "User's request (e.g., 'Plan my day with gym at 9 and work at 10')" }
                },
                "required": ["request"]
            }
        ),
        Tool(
            name="detect_language",
            description="Detect language of text (ur/en)",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": { "type": "string", "description": "Text to analyze" }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="suggest_priority",
            description="Suggest priority based on content",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": { "type": "string", "description": "Task description or context" }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="schedule_reminder",
            description="Parse recurrence or due dates",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": { "type": "string", "description": "Time-related text (tomorrow, next week)" }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="get_deployment_blueprint",
            description="Get K8s deployment YAML",
            inputSchema={
                "type": "object",
                "properties": {
                    "type": { "type": "string", "description": "Blueprint type (minimal, scale)" }
                },
                "required": ["type"]
            }
        )
    ]

# Helper for Chat Router
def get_tool_definitions(tools: List[Tool]) -> str:
    """Convert tools list to a string definition for the system prompt."""
    defs = []
    for t in tools:
        defs.append(f"Tool: {t.name}")
        defs.append(f"Description: {t.description}")
        defs.append(f"Input Schema: {json.dumps(t.inputSchema)}")
        defs.append("---")
    return "\n".join(defs)


# Main Logic used by both MCP Server and Chat Router
async def handle_tool_call(name: str, arguments: Any, user_id: str, session: Session) -> Any:
    """Execute tool logic with provided session and user context."""
    
    if name == "add_task":
        title = arguments.get("title")
        desc = arguments.get("description", "")
        priority = arguments.get("priority", "medium")
        tags = arguments.get("tags", [])
        
        task = Task(
            title=title, 
            description=desc, 
            priority=priority, 
            tags=tags,
            user_id=user_id
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"status": "success", "message": f"Task created: '{task.title}' with {task.priority} priority (ID: {task.id})", "task": task.model_dump()}

    elif name == "list_tasks":
        status = arguments.get("status", "all")
        limit = arguments.get("limit", 20)
        
        query = select(Task).where(Task.user_id == user_id)
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
            
        tasks = session.exec(query.limit(limit)).all()
        
        if not tasks:
            return {"status": "success", "message": "No tasks found.", "tasks": []}
        
        task_list = [t.model_dump() for t in tasks]
        return {"status": "success", "message": f"Found {len(tasks)} tasks.", "tasks": task_list}

    elif name == "complete_task":
        task_id = arguments.get("task_id")
        completed = arguments.get("completed", True)
        
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return {"status": "error", "message": f"Task with ID {task_id} not found."}
        
        task.completed = completed
        session.add(task)
        session.commit()
        status_text = "completed" if completed else "marked as pending"
        return {"status": "success", "message": f"Task '{task.title}' has been {status_text}."}

    elif name == "bulk_complete_tasks":
        task_ids = arguments.get("task_ids", [])
        completed = arguments.get("completed", True)
        
        if not task_ids:
             return {"status": "error", "message": "No task IDs provided."}

        # Select tasks that match IDs AND user_id
        query = select(Task).where(col(Task.id).in_(task_ids), Task.user_id == user_id)
        tasks = session.exec(query).all()
        
        if not tasks:
             return {"status": "error", "message": "No valid tasks found."}

        count = 0
        for t in tasks:
            t.completed = completed
            session.add(t)
            count += 1
        session.commit()
        
        status_text = "completed" if completed else "marked as pending"
        return {"status": "success", "message": f"{count} tasks {status_text}."}

    elif name == "delete_task":
        task_id = arguments.get("task_id")
        title_match = arguments.get("title")
        
        task = None
        if task_id:
            task = session.get(Task, task_id)
            if task and task.user_id != user_id:
                task = None # Security check
        elif title_match:
            query = select(Task).where(Task.user_id == user_id, Task.title.ilike(f"%{title_match}%"))
            task = session.exec(query).first()
        else:
            return {"status": "error", "message": "Please provide either task_id or title to delete."}
        
        if not task:
            return {"status": "error", "message": "Task not found."}
        
        task_title = task.title
        session.delete(task)
        session.commit()
        return {"status": "success", "message": f"Task '{task_title}' has been deleted."}

    elif name == "bulk_delete_tasks":
        task_ids = arguments.get("task_ids", [])
        if not task_ids:
             return {"status": "error", "message": "No task IDs provided."}
        
        query = select(Task).where(col(Task.id).in_(task_ids), Task.user_id == user_id)
        tasks = session.exec(query).all()
        
        if not tasks:
             return {"status": "error", "message": "No valid tasks found to delete."}
             
        count = 0
        for t in tasks:
            session.delete(t)
            count += 1
        session.commit()
        
        return {"status": "success", "message": f"Deleted {count} tasks."}

    elif name == "update_task":
        task_id = arguments.get("task_id")
        
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return {"status": "error", "message": f"Task with ID {task_id} not found."}
        
        if "title" in arguments:
            task.title = arguments["title"]
        if "description" in arguments:
            task.description = arguments["description"]
        if "priority" in arguments:
            task.priority = arguments["priority"]
        
        session.add(task)
        session.commit()
        return {"status": "success", "message": f"Task #{task.id} has been updated: '{task.title}' ({task.priority})"}

    elif name == "get_weather":
        city = arguments.get("city")
        if not city:
             return {"status": "error", "message": "City name is required."}
        
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                # 1. Geocode
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
                geo_resp = await client.get(geo_url)
                geo_data = geo_resp.json()
                
                if not geo_data.get("results"):
                     return {"status": "error", "message": f"City '{city}' not found."}
                
                location = geo_data["results"][0]
                lat = location["latitude"]
                lon = location["longitude"]
                city_name = location["name"]
                
                # 2. Forecast
                url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code"
                weather_resp = await client.get(url)
                weather_data = weather_resp.json()
                
                temp = weather_data["current"]["temperature_2m"]
                code = weather_data["current"]["weather_code"]
                unit = weather_data["current_units"]["temperature_2m"]
                
                # Code mapping
                desc = "Clear sky"
                if code in [1, 2, 3]: desc = "Partly cloudy"
                elif code in [45, 48]: desc = "Foggy"
                elif code in [51, 53, 55, 56, 57]: desc = "Drizzle"
                elif code in [61, 63, 65, 66, 67]: desc = "Rain"
                elif code in [71, 73, 75, 77]: desc = "Snow"
                elif code >= 80: desc = "Showers/Thunderstorm"
                
                return {"status": "success", "message": f"Current weather in {city_name}: {temp}{unit}, {desc}", "data": {"temp": temp, "desc": desc}}
        except Exception as e:
             return {"status": "error", "message": f"Failed to fetch weather: {str(e)}"}

    # --- Agent Skills (All Async) ---
    elif name == "detect_language":
        from app.skills import AVAILABLE_SKILLS
        text = arguments.get("text", "")
        # Await async execution
        result = await AVAILABLE_SKILLS["lang_detector"].execute(text, user_id=user_id, session=session)
        return {"status": "success", "language": result}

    elif name == "suggest_priority":
        from app.skills import AVAILABLE_SKILLS
        text = arguments.get("text", "")
        result = await AVAILABLE_SKILLS["priority_suggester"].execute(text, user_id=user_id, session=session)
        return {"status": "success", "priority": result}

    elif name == "schedule_reminder":
        from app.skills import AVAILABLE_SKILLS
        text = arguments.get("text", "")
        result = await AVAILABLE_SKILLS["reminder_scheduler"].execute(text, user_id=user_id, session=session)
        return {"status": "success", "reminder_date": result.isoformat() if result else None}

    elif name == "get_deployment_blueprint":
        from app.skills import AVAILABLE_SKILLS
        type_ = arguments.get("type", "minimal")
        result = await AVAILABLE_SKILLS["deployment_blueprint"].execute(type_, user_id=user_id, session=session)
        return {"status": "success", "blueprint": result}

    elif name == "plan_day":
        from app.skills import AVAILABLE_SKILLS
        request = arguments.get("request", "")
        result = await AVAILABLE_SKILLS["day_planner"].execute(request, user_id=user_id, session=session)
        return {"status": "success", "message": result}

    raise ValueError(f"Tool not found: {name}")


@app_mcp.call_tool()
async def call_tool(name: str, arguments: Any) -> List[TextContent | ImageContent | EmbeddedResource]:
    """MCP Entry point - Uses local DB session and mock user."""
    # This is for the MCP server interface (if running standalone)
    with Session(engine) as session:
        # We default to user_123 for MCP local usage
        result = await handle_tool_call(name, arguments, "user_123", session)
        
        # Convert dictionary result to MCP TextContent
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
