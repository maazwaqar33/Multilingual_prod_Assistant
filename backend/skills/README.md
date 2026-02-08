# Agent Skills for TodoEvolve

This directory contains **reusable agent skills** that provide modular AI capabilities.
These skills are designed to be composable and can be used across different phases of the application.

## Available Skills

### 1. LangDetectorSkill
Detects user language (Urdu/English) from input text.
```python
from skills import LangDetectorSkill
lang = LangDetectorSkill.detect("یہ ایک کام ہے")  # Returns "ur"
```

### 2. TaskPrioritySkill
AI-powered priority suggestion based on task content.
```python
from skills import TaskPrioritySkill
priority = TaskPrioritySkill.suggest("Meeting with CEO tomorrow")  # Returns "high"
```

### 3. VoiceTranscriptionSkill
Voice-to-text using Web Speech API (frontend) or Whisper (backend).

### 4. DeploymentBlueprintSkill
Generates K8s manifests for cloud deployment.

## Design Philosophy

- **Modular**: Each skill has a single responsibility
- **Composable**: Skills can be chained together
- **Testable**: Pure functions with no side effects
- **Reusable**: Works across CLI, API, and Chat interfaces
