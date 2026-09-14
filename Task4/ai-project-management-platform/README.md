# Task 4 — AI-Powered Project & Task Management Platform

Capstone integration of frontend, Express REST API, PostgreSQL, authentication and AI-assisted task generation.

## Features
- Registration, login, logout and JWT-protected API routes
- Dashboard statistics
- Project create/read/update/delete endpoints
- Task create/update/delete, priority, status, due date, search and filter
- AI-assisted task generation with Gemini
- PostgreSQL + Prisma persistence
- React frontend

## Backend setup
```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Set `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY` in `backend/.env`. Never commit real values.

## Frontend setup
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend calls `http://localhost:4000/api` by default.

## Deployment
Suggested split:
- Frontend: Vercel or Netlify
- Backend: Render or Railway
- PostgreSQL: Neon, Railway or Render Postgres

## AI feature
`POST /api/ai/generate-tasks` accepts project name/description and returns structured task suggestions. The frontend can insert those suggestions as real persisted tasks.
