# TodoEvolve Constitution

> **Smart Multilingual Productivity Assistant**  
> Guiding principles for all AI agents and development decisions

---

## Core Principles

### 1. Minimalism First
- UI/UX must be clean, intuitive, and mobile-first
- No unnecessary elements, modals, or visual noise
- Focus on essential functionality over feature bloat
- White space is valuable; use it generously

### 2. Meaningful Impact
- Features must solve real problems for multilingual users
- Support Urdu/English seamlessly throughout the application
- Accessibility is non-negotiable (ARIA labels, keyboard navigation, voice)
- Design for users in regions with infrastructure challenges (offline-first thinking)

### 3. Reusability & Modularity
- All agents and subagents must be modular skills
- Blueprints for cloud deployment must be reusable
- DRY (Don't Repeat Yourself) across all code
- KISS (Keep It Simple, Stupid) for all implementations

### 4. Security & Privacy
- JWT authentication with proper validation
- Complete user data isolation (no cross-user data exposure)
- No PII in logs or error messages
- Secrets in environment variables, never in code
- HTTPS everywhere in production

### 5. Tech Stack Constraints
- Frontend: Next.js 15+ (App Router), TypeScript, Tailwind CSS
- Backend: Python FastAPI, SQLModel ORM
- Database: Neon Serverless PostgreSQL
- AI: Gemini API (primary), OpenAI ChatKit/Agents SDK where compatible
- Containerization: Docker, Kubernetes (Minikube → Oracle OKE)
- Event-Driven: Kafka/Redpanda Cloud, Dapr

### 6. Exceptional Standards
- 100% spec coverage before implementation
- Comprehensive error handling with user-friendly messages
- Graceful degradation when services are unavailable
- All edge cases must be considered and handled

---

## Design System

### Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `#6366F1` | `#6366F1` | Buttons, links, highlights |
| Surface | `#FAFAFC` | `#0F1117` | Backgrounds |
| Text Primary | `#1F2937` | `#F9FAFB` | Main text |
| Text Secondary | `#6B7280` | `#9CA3AF` | Muted text |
| Success | `#10B981` | `#10B981` | Completed states |
| Warning | `#F59E0B` | `#F59E0B` | Priority high |
| Danger | `#EF4444` | `#EF4444` | Delete, errors |

### Typography
- Primary Font: Geist (Vercel), fallback to Inter
- Body: 16px base, line-height 1.5-1.75
- Headings: Geist, semibold, tight line-height

### Responsive Breakpoints
- Mobile: 375px (base)
- Tablet: 768px (md)
- Desktop: 1024px (lg)
- Large: 1280px (xl)

---

## Agent Behavior Rules

1. **Never generate code without a referenced Task ID from specs**
2. **Never modify architecture without updating specs/architecture.md**
3. **Never propose features without updating speckit.constitution**
4. **Every code file must link to its spec section**
5. **If specs are unclear, STOP and request clarification**

---

## Quality Gates

### Before Implementation
- [ ] Spec file exists and is complete
- [ ] Acceptance criteria defined
- [ ] Edge cases documented

### Before Merge/Deploy
- [ ] All tests pass
- [ ] Cross-browser tested (Chrome, Firefox, Edge)
- [ ] Responsive design verified
- [ ] Accessibility audit passed
- [ ] No console errors or warnings
