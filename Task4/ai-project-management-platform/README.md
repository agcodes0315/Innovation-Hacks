# Task 4 — AI-Powered Project & Task Management Platform

Full-stack capstone combining authentication, project management, task management, persistent storage, dashboard metrics and local AI task generation.

## Stack
- React + Vite frontend
- Node.js + Express backend
- Prisma ORM + SQLite database
- JWT + bcrypt authentication
- Ollama local AI (no paid API key)

## Backend setup (Windows PowerShell)
```powershell
cd backend
Copy-Item .env.example .env -Force
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend: `http://localhost:4000`

## Frontend setup (second terminal)
```powershell
cd frontend
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Optional local AI setup
Install Ollama once on Windows, then:
```powershell
ollama pull llama3.2:3b
ollama serve
```
The AI endpoint uses the local model configured by `OLLAMA_MODEL` and requires no cloud API key.

## Database inspection
From `backend`:
```powershell
npx prisma studio
```
