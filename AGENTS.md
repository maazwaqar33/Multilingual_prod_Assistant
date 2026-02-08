# AGENTS.md

## Purpose

This project uses **Spec-Driven Development (SDD)** — a workflow where **no agent is allowed to write code until the specification is complete and approved**.

All AI agents (Claude, Copilot, Gemini, local LLMs, etc.) must follow the **Spec-Kit lifecycle**:

> **Specify → Plan → Tasks → Implement**

This prevents "vibe coding," ensures alignment across agents, and guarantees that every implementation step maps back to an explicit requirement.

---

## How Agents Must Work

Every agent in this project MUST obey these rules:

1. **Never generate code without a referenced Task ID**
2. **Never modify architecture without updating specs**
3. **Never propose features without updating specs/features/**
4. **Never change principles without updating speckit.constitution.md**
5. **Every code file must contain a comment linking it to the spec**

If an agent cannot find the required spec, it must **stop and request it**.

---

## Spec-Kit Workflow

### 1. Constitution (WHY)
File: `speckit.constitution.md`

Defines project non-negotiables: architecture values, security rules, tech stack constraints, performance expectations.

### 2. Features (WHAT)
Directory: `specs/features/`

Contains user stories, requirements, acceptance criteria, domain rules.

### 3. API (HOW - Backend)
Directory: `specs/api/`

REST endpoints, MCP tools, request/response schemas.

### 4. Database (HOW - Data)
Directory: `specs/database/`

Schema definitions, relationships, indexes.

### 5. UI (HOW - Frontend)
Directory: `specs/ui/`

Component specs, page layouts, interaction patterns.

---

## Agent Code Generation Rules

When generating code, agents must reference:
```
# [Spec]: specs/features/task-crud.md
# [Task]: Create task function
```

When proposing architecture changes:
```
Update required in specs/architecture.md
```

When proposing new features:
```
Requires update in specs/features/[feature].md
```

---

## Hierarchy

If conflict arises between spec files:

**Constitution > Features > API > Database > UI**

Constitution always wins.

---

## Quality Standards

- Clean code (OOP, DRY, KISS)
- Error handling on all operations
- Input validation everywhere
- Graceful degradation
- Mobile-first responsive design
- WCAG AA accessibility compliance
