# TodoEvolve - Smart Multilingual Productivity Assistant 🚀

> **Hackathon II: The Evolution of Todo**
> Mastering Spec-Driven Development & Cloud Native AI

**TodoEvolve** is a next-generation productivity application that transforms a simple task list into an intelligent, voice-activated personal assistant. It combines modern web technologies with advanced AI agents to help you plan your day, manage tasks, and stay organized—in both **English and Urdu**.

![Project Demo](https://placehold.co/800x400?text=TodoEvolve+Demo+Screen)

---

## ✨ Key Features

### 🤖 Intelligent AI Agent
- **Natural Language Planning**: "Plan my day with a meeting at 10 AM and gym at 5 PM" -> Auto-creates schedule.
- **Smart Context**: Understands priority, time, and language automatically.
- **Dual-Engine AI**: Robust fallback system using **Llama 3.3 (OpenRouter)** and **Gemini 1.5 Flash**.

### 🗣️ Voice Command Center
- **Hands-Free Control**: Add, complete, or query tasks using voice commands.
- **Continuous Listening**: Fluid conversation mode with "Stop" control.
- **Multilingual Recognition**: Supports English and Urdu voice inputs.

### 🌍 Application Features
- **Project Board**: Kanban-style or List view for task management.
- **Auth System**: Secure JWT authentication with Email Verification & Password Reset.
- **Dark/Light Mode**: Beautiful UI with Tailwind CSS and Radix UI.
- **Responsive Design**: Fully optimized for mobile and desktop.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python FastAPI, SQLModel (SQLite/PostgreSQL)
- **AI Integration**: OpenAI SDK (compatible), Google Gemini, OpenRouter
- **DevOps**: Docker, Docker Compose, Kubernetes (Helm Charts provided)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/todo-evolve.git
cd todo-evolve
```

### 2. Environment Setup
Create a `.env` file in `backend/` based on `.env.example`:
```ini
DATABASE_URL=sqlite:///./todo.db
BETTER_AUTH_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

### 3. Run with Docker (Recommended)
```bash
docker-compose up --build
```
The app will be available at:
- **Frontend**: http://localhost:3005
- **Backend**: http://localhost:8000

---

## ☁️ Deployment

### Frontend (Vercel)
This project is optimized for deployment on Vercel.
1. Push to GitHub.
2. Import project in Vercel.
3. Set `NEXT_PUBLIC_API_URL` to your backend URL.

### Backend (Kubernetes / Docker)
Includes production-ready `Dockerfile` and Helm charts for deployment on DigitalOcean Kubernetes or any standard K8s cluster.

---

## 🏆 Hackathon Achievements

This project successfully implements all 5 Phases of the challenge:
1.  **Phase I**: Python Console App (Foundation)
2.  **Phase II**: Full-Stack Web App (FastAPI + Next.js)
3.  **Phase III**: AI Chatbot (Agentic Workflow)
4.  **Phase IV**: Containerization (Docker)
5.  **Phase V**: Cloud Native (Kubernetes Ready)

**Bonus Achievements:**
- ✅ Multilingual Support (Urdu/English)
- ✅ Voice Input Integration
- ✅ Reusable AI Skills Architecture

---

### License
MIT License
