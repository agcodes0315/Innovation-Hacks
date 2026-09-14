# Task 4 — AI-Powered Project & Task Management Platform

## Architecture

```text
React + Vite
    |
    | HTTP / JWT
    v
Express REST API
    |
    +--> SQLite
    |
    +--> Ollama (optional local LLM)
```

## Terminal 1 — backend

```powershell
cd backend
Copy-Item .env.example .env -Force
npm install
npm run dev
```

## Terminal 2 — frontend

```powershell
cd frontend
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Local AI demo

For a genuine AI-powered task-generation demonstration, install Ollama and run:

```powershell
ollama pull llama3.2:3b
ollama serve
```

Then create a project and click **AI Generate**.

The application stores generated tasks in SQLite and marks tasks from the local LLM with an `AI` badge.

## Features

- Registration, login, logout
- JWT-protected routes
- bcrypt password hashing
- Persistent SQLite database
- Project create, edit, delete, detail view
- Task create, update status, delete
- Task priorities and due dates
- Task search and filters
- Dashboard task/project statistics
- Project progress indicators
- Recent activity feed
- Local AI-assisted task generation with Ollama
- Responsive UI
- Loading, empty, and error states

## Production note

SQLite is ideal for this internship demo and local development. If you later deploy to an environment with ephemeral storage, move the same SQL model to a managed persistent database or deploy the backend on a host with a persistent disk.
