# Backend Guidelines

## Stack
- FastAPI
- SQLModel (ORM)
- Neon PostgreSQL
- Python 3.12+

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app entry
│   ├── config.py         # Environment configuration
│   ├── database.py       # Database connection
│   ├── models.py         # SQLModel models
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # JWT validation
│   └── routes/
│       ├── __init__.py
│       ├── tasks.py      # Task CRUD endpoints
│       └── health.py     # Health check
├── tests/
├── pyproject.toml
└── .env.example
```

## API Conventions
- All routes under `/api/`
- Return JSON responses
- Use Pydantic models for request/response
- Handle errors with HTTPException
- CORS enabled for Vercel frontend

## Authentication
- JWT tokens from Better Auth frontend
- Validate with shared BETTER_AUTH_SECRET
- Extract user_id from token claims
- Filter all queries by user_id

## Environment Variables
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Shared secret for JWT validation
- `CORS_ORIGINS` - Allowed frontend origins

## Running
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

## Referenced Specs
- `@specs/features/task-crud.md` - Task CRUD operations
- `@specs/api/rest-endpoints.md` - API specifications
- `@specs/database/schema.md` - Database models
