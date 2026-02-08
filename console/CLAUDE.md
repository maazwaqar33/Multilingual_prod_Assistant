# Console App Guidelines

## Stack
- Python 3.13+
- UV package manager
- In-memory storage (dict)

## Project Structure
```
console/
├── src/
│   ├── __init__.py
│   ├── models.py      # Task dataclass
│   ├── task_manager.py # Business logic
│   └── main.py        # CLI interface
├── tests/
│   └── test_task_manager.py
└── pyproject.toml
```

## Patterns
- Use dataclasses for models
- Single TaskManager class for all operations
- Type hints on all functions
- Docstrings for public methods

## Referenced Specs
- `@specs/features/task-crud.md` - Feature requirements

## Error Handling
- All user inputs must be validated
- Graceful error messages (no stack traces to user)
- Invalid IDs return friendly errors

## Running
```bash
cd console
uv run python -m src.main
```

## Testing
```bash
cd console
uv run pytest tests/ -v
```
