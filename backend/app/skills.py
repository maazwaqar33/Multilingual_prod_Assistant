
import re
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlmodel import Session
from app.models import Task
from app.ai.engine import dual_provider_chat, extract_json


class BaseSkill:
    """Base class for all agent skills."""
    name: str = "base_skill"
    description: str = "Base skill description"

    async def execute(self, content: str, **kwargs) -> Any:
        raise NotImplementedError


class LangDetectorSkill(BaseSkill):
    """Detects whether text is Urdu or English."""
    name = "lang_detector"
    description = "Detects if text contains Urdu characters"

    async def execute(self, content: str, **kwargs) -> str:
        # Urdu Unicode block: 0600–06FF
        urdu_pattern = re.compile(r'[\u0600-\u06FF]')
        if urdu_pattern.search(content):
            return "ur"
        return "en"


class PrioritySuggesterSkill(BaseSkill):
    """Suggests task priority based on keywords."""
    name = "priority_suggester"
    description = "Suggests priority (high, medium, low) based on intent"

    async def execute(self, content: str, **kwargs) -> str:
        content_lower = content.lower()
        
        high_keywords = ['urgent', 'asap', 'immediate', 'today', 'critical', 'important', 'ضروری', 'آج']
        medium_keywords = ['tomorrow', 'week', 'soon', 'later', 'کل']
        low_keywords = ['someday', 'maybe', 'wish', 'whenever', 'کبھی']

        if any(k in content_lower for k in high_keywords):
            return "high"
        if any(k in content_lower for k in medium_keywords):
            return "medium"
        if any(k in content_lower for k in low_keywords):
            return "low"
            
        return "medium"  # Default


class ReminderSchedulerSkill(BaseSkill):
    """Extracts date/time for reminders."""
    name = "reminder_scheduler"
    description = "Parses simple recurrence logic or due dates"

    async def execute(self, content: str, **kwargs) -> Optional[datetime]:
        content_lower = content.lower()
        now = datetime.now()

        if 'tomorrow' in content_lower or 'کل' in content_lower:
            return now + timedelta(days=1)
        if 'next week' in content_lower:
            return now + timedelta(weeks=1)
        if 'usage' in content_lower: # Example placehoder logic
             pass
             
        return None


class DeploymentBlueprintSkill(BaseSkill):
    """Generates K8s deployment blueprints."""
    name = "deployment_blueprint"
    description = "Generates K8s YAML for deployments"

    async def execute(self, content: str, **kwargs) -> str:
        content_lower = content.lower()
        
        if 'minimal' in content_lower:
            return """
apiVersion: v1
kind: Pod
metadata:
  name: minimal-pod
spec:
  containers:
  - name: nginx
    image: nginx:alpine
"""
        if 'scale' in content_lower:
             return "kubectl scale deployment frontend --replicas=3"
             
        return "Available blueprints: minimal-pod, scale-deployment"


class DayPlannerSkill(BaseSkill):
    """Plans a day by creating multiple tasks based on user request."""
    name = "day_planner"
    description = "Create a schedule of tasks for the day"

    async def execute(self, content: str, **kwargs) -> str:
        session: Session = kwargs.get('session')
        user_id: str = kwargs.get('user_id')
        
        if not session or not user_id:
            return "Error: Session or User ID missing for planning."

        # Prompt
        system_prompt = """You are a pro-active planning assistant.
Convert the user's request into a list of tasks.
Return STRICTLY a JSON list of objects. No markdown, no prose.
Each object must have:
- title (str)
- description (str, optional)
- priority (high/medium/low)
- tags (list of strings)

Example Input: "Plan my day: Code at 9, Lunch at 12"
Example Output:
[
    {"title": "Code", "description": "at 9", "priority": "high", "tags": ["work"]},
    {"title": "Lunch", "description": "at 12", "priority": "medium", "tags": ["personal"]}
]
"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content}
        ]
        
        try:
            response_text, _ = await dual_provider_chat(messages)
            
            # Extract JSON
            json_str = response_text.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
            
            tasks_data = json.loads(json_str)
            
            if not isinstance(tasks_data, list):
                return f"Error: AI returned {type(tasks_data)}, expected list."
                
            created_count = 0
            titles = []
            
            for task_data in tasks_data:
                task = Task(
                    title=task_data.get("title", "Untitled"),
                    description=task_data.get("description", ""),
                    priority=task_data.get("priority", "medium"),
                    tags=task_data.get("tags", []),
                    user_id=user_id,
                )
                session.add(task)
                titles.append(task.title)
                created_count += 1
                
            session.commit()
            
            if created_count == 0:
                return "No tasks identified in your request."
                
            return f"I've created {created_count} tasks for you: {', '.join(titles)}."
            
        except Exception as e:
            return f"Failed to generate plan: {str(e)}"


# Simple registry
AVAILABLE_SKILLS = {
    "lang_detector": LangDetectorSkill(),
    "priority_suggester": PrioritySuggesterSkill(),
    "reminder_scheduler": ReminderSchedulerSkill(),
    "deployment_blueprint": DeploymentBlueprintSkill(),
    "day_planner": DayPlannerSkill(),
}
