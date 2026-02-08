# [Spec]: specs/features/organization.md
# Task Priority Skill - Reusable Intelligence

"""
TaskPrioritySkill: AI-powered priority suggestion based on task content.
Used by: Chat Agent, Task Creation, Smart Suggestions
"""

import re
from typing import Literal, List
from datetime import datetime, timedelta


class TaskPrioritySkill:
    """
    Suggests task priority based on content analysis.
    Uses keyword matching and deadline detection.
    """
    
    # Keywords that indicate high priority
    HIGH_PRIORITY_KEYWORDS = [
        "urgent", "asap", "immediately", "critical", "emergency",
        "deadline", "due today", "due tomorrow", "important meeting",
        "ceo", "client", "presentation", "interview", "exam",
        # Urdu keywords
        "فوری", "ضروری", "اہم"
    ]
    
    # Keywords that indicate low priority
    LOW_PRIORITY_KEYWORDS = [
        "later", "eventually", "someday", "maybe", "if possible",
        "no rush", "whenever", "optional", "nice to have",
        # Urdu keywords
        "بعد میں", "کبھی"
    ]
    
    # Time-sensitive patterns
    TIME_PATTERNS = [
        r"today",
        r"tonight",
        r"tomorrow",
        r"this week",
        r"in \d+ hours?",
        r"by \d{1,2}:\d{2}",
    ]
    
    @classmethod
    def suggest(cls, task_title: str, task_description: str = "") -> Literal["high", "medium", "low"]:
        """
        Suggest priority for a task based on its content.
        
        Args:
            task_title: The task title
            task_description: Optional task description
            
        Returns:
            Suggested priority: "high", "medium", or "low"
        """
        text = f"{task_title} {task_description}".lower()
        
        # Check for high priority keywords
        for keyword in cls.HIGH_PRIORITY_KEYWORDS:
            if keyword.lower() in text:
                return "high"
        
        # Check for time-sensitive patterns
        for pattern in cls.TIME_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return "high"
        
        # Check for low priority keywords
        for keyword in cls.LOW_PRIORITY_KEYWORDS:
            if keyword.lower() in text:
                return "low"
        
        # Default to medium
        return "medium"
    
    @classmethod
    def analyze(cls, task_title: str, task_description: str = "") -> dict:
        """
        Full analysis of task priority with reasoning.
        
        Returns:
            Dict with priority and reasoning
        """
        priority = cls.suggest(task_title, task_description)
        text = f"{task_title} {task_description}".lower()
        
        reasons = []
        
        if priority == "high":
            for keyword in cls.HIGH_PRIORITY_KEYWORDS:
                if keyword.lower() in text:
                    reasons.append(f"Contains keyword: '{keyword}'")
                    break
            for pattern in cls.TIME_PATTERNS:
                if re.search(pattern, text, re.IGNORECASE):
                    reasons.append("Time-sensitive task")
                    break
        elif priority == "low":
            for keyword in cls.LOW_PRIORITY_KEYWORDS:
                if keyword.lower() in text:
                    reasons.append(f"Contains keyword: '{keyword}'")
                    break
        else:
            reasons.append("No priority indicators found")
        
        return {
            "priority": priority,
            "confidence": 0.8 if reasons else 0.5,
            "reasons": reasons
        }


# Export for direct import
suggest_priority = TaskPrioritySkill.suggest
