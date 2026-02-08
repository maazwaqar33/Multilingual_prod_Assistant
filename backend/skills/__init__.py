# TodoEvolve Agent Skills
# Reusable Intelligence for +200 Bonus

"""
Agent skills are modular, composable AI capabilities that can be used
across different phases of the application (CLI, Web, Chat, K8s).
"""

from .lang_detector import LangDetectorSkill
from .task_priority import TaskPrioritySkill
from .deployment_blueprint import DeploymentBlueprintSkill

__all__ = [
    "LangDetectorSkill",
    "TaskPrioritySkill", 
    "DeploymentBlueprintSkill"
]
