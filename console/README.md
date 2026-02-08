# TodoEvolve Console App

> Phase I: In-Memory Python Console Application

## Overview

TodoEvolve is a Smart Multilingual Productivity Assistant that evolves from a simple console app to a cloud-native AI chatbot. This is Phase I - the console application.

## Features

- ✅ **Add Task** - Create new todo items with title and description
- ✅ **View Tasks** - Display all tasks with status indicators
- ✅ **Update Task** - Modify existing task details
- ✅ **Delete Task** - Remove tasks from the list
- ✅ **Toggle Complete** - Mark tasks as done/undone

## Setup

### Prerequisites

- Python 3.11+ 
- [UV](https://docs.astral.sh/uv/) package manager

### Installation

```bash
# Navigate to console directory
cd console

# Create virtual environment and install dependencies
uv sync

# Or install with pip
pip install -e .
```

## Usage

### Run the Application

```bash
# Using UV
uv run python -m src.main

# Or using the entry point
uv run todoevolve
```

### Interactive Commands

```
╔══════════════════════════════════════════════════════════════╗
║     🚀 TodoEvolve - Smart Multilingual Productivity          ║
╠══════════════════════════════════════════════════════════════╣
║  1. ➕ Add Task                                               ║
║  2. 📋 View Tasks                                             ║
║  3. 🗑️  Delete Task                                            ║
║  4. ✏️  Update Task                                            ║
║  5. ✅ Toggle Complete                                        ║
║  6. 🚪 Exit                                                   ║
╚══════════════════════════════════════════════════════════════╝
```

## Testing

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ -v --cov=src
```

## Project Structure

```
console/
├── src/
│   ├── __init__.py        # Package exports
│   ├── models.py          # Task dataclass
│   ├── task_manager.py    # Business logic
│   └── main.py            # CLI interface
├── tests/
│   ├── __init__.py
│   └── test_task_manager.py
├── pyproject.toml         # Project configuration
├── CLAUDE.md              # AI agent guidelines
└── README.md              # This file
```

## Specification

This implementation follows the spec at `specs/features/task-crud.md`.

## Next Phases

- **Phase II**: Full-Stack Web Application (Next.js + FastAPI)
- **Phase III**: AI-Powered Chatbot (Gemini + MCP)
- **Phase IV**: Local Kubernetes Deployment
- **Phase V**: Cloud Deployment with Kafka/Dapr

---

*Part of TodoEvolve - Smart Multilingual Productivity Assistant*
