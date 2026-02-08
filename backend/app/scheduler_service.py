import logging
import os
from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi import FastAPI, Body, status
from pydantic import BaseModel
try:
    from dapr.clients import DaprClient
    DAPR_AVAILABLE = True
except ImportError:
    DaprClient = object
    DAPR_AVAILABLE = False

import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler-service")

app = FastAPI(title="Recurring Task Scheduler")

# Dapr configuration
PUBSUB_NAME = os.getenv("DAPR_PUBSUB_NAME", "pubsub")
TOPIC_NAME = "task.updated"

class CloudEvent(BaseModel):
    data: Dict[str, Any]
    topic: str
    pubsubname: str
    id: str
    source: str
    specversion: str
    type: str

@app.get("/dapr/subscribe")
def subscribe():
    subscriptions = [
        {
            "pubsubname": PUBSUB_NAME,
            "topic": TOPIC_NAME,
            "route": "handle-task-updated"
        }
    ]
    logger.info(f"Subscribed to: {subscriptions}")
    return subscriptions

@app.post("/handle-task-updated")
async def handle_task_updated(event: CloudEvent = Body(...)):
    """
    Handle task.updated event.
    If task is completed and recurring, create the next instance.
    """
    data = event.data
    logger.info(f"Received event: {data}")
    
    try:
        task_id = data.get("id")
        is_completed = data.get("completed")
        is_recurring = data.get("is_recurring")
        recurrence_interval = data.get("recurrence_interval")
        user_id = data.get("user_id")
        
        # Check recurrence conditions
        if is_completed and is_recurring and recurrence_interval:
            logger.info(f"Processing recurrence for task {task_id}")
            await create_next_task(data)
            
    except Exception as e:
        logger.error(f"Error processing event: {e}")
        return {"status": "ERROR"}

    return {"status": "SUCCESS"}

async def create_next_task(prev_task: Dict[str, Any]):
    """Calculate next due date and call Dapr to create task."""
    try:
        recurrence = prev_task.get("recurrence_interval", "daily").lower()
        due_date_str = prev_task.get("due_date")
        
        if not due_date_str:
            base_date = datetime.utcnow()
        else:
            base_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))

        # Calculate next date
        if recurrence == "daily":
            next_date = base_date + timedelta(days=1)
        elif recurrence == "weekly":
            next_date = base_date + timedelta(weeks=1)
        elif recurrence == "monthly":
            next_date = base_date + timedelta(days=30) # Approx
        else:
            next_date = base_date + timedelta(days=1) # Default
            
        new_task = {
            "title": prev_task.get("title"),
            "description": prev_task.get("description"),
            "priority": prev_task.get("priority"),
            "tags": prev_task.get("tags"),
            "is_recurring": True,
            "recurrence_interval": recurrence,
            "due_date": next_date.isoformat(),
            "user_id": prev_task.get("user_id")
        }
        
        # Use Dapr Client to call Main Backend Service to create task
        # Service Invocation
        with DaprClient() as d:
            resp = d.invoke_method(
                app_id="todo-backend",
                method_name=f"api/{new_task['user_id']}/tasks",
                data=json.dumps(new_task),
                http_verb="POST"
            )
            logger.info(f"Created next recurring task: {resp.text()}")

    except Exception as e:
        logger.error(f"Failed to create next task: {e}")
