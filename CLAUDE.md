# TodoEvolve - Smart Multilingual Productivity Assistant

## Project Overview
This is a monorepo using GitHub Spec-Kit for spec-driven development. The project evolves from a simple console app to a cloud-native AI chatbot.

## Spec-Kit Structure
Specifications are organized in `/specs`:
- `/specs/overview.md` - Project overview
- `/specs/features/` - Feature specs (what to build)
- `/specs/api/` - API endpoint and MCP tool specs
- `/specs/database/` - Schema and model specs
- `/specs/ui/` - Component and page specs
- `/specs/deployment/` - Infrastructure specs

## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: `@specs/features/task-crud.md`
3. Update specs if requirements change
4. Never implement without a spec

## Project Structure
```
├── .spec-kit/          # Spec-Kit configuration
├── specs/              # All specifications
├── console/            # Phase I: Python console app
├── frontend/           # Phase II+: Next.js app
├── backend/            # Phase II+: FastAPI server
├── helm/               # Phase IV+: Kubernetes charts
└── docker-compose.yml  # Local development
```

## Development Workflow
1. Read spec: `@specs/features/[feature].md`
2. Implement backend: `@backend/CLAUDE.md`
3. Implement frontend: `@frontend/CLAUDE.md`
4. Test and iterate

## Commands
```bash
# Phase I: Console
cd console && uv run python -m src.main

# Phase II+: Frontend
cd frontend && npm run dev

# Phase II+: Backend
cd backend && uv run uvicorn main:app --reload

# Both with Docker
docker-compose up
```

## Key Files
- `speckit.constitution.md` - Project principles and constraints
- `AGENTS.md` - Agent behavior rules
- `specs/` - All feature specifications

## Agent Skills (Backend)
Located in `backend/app/skills.py`:
- **LangDetectorSkill**: Detects Urdu vs English text.
- **PrioritySuggesterSkill**: Infers priority (High/Medium/Low) from keywords like "urgent", "tomorrow".
- **ReminderSchedulerSkill**: Parses dates from text (e.g., "next week").
- **DeploymentBlueprintSkill**: Generates K8s YAML snippets.

## Free Resources Used
- **Database**: Neon PostgreSQL (free tier)
- **Frontend Hosting**: Vercel (free)
- **Backend Hosting**: Hugging Face Spaces (free)
- **AI Provider**: Gemini API (free tier)
- **Kafka**: Redpanda Cloud (free serverless)
- **Kubernetes**: Oracle Cloud OKE (always free)
