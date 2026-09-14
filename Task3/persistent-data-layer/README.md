# Task 3 — Persistent Data Layer

This task adds a real persistent SQLite database to the Users, Projects & Tasks API using Prisma ORM.

## Stack
- Node.js
- Express
- Prisma ORM
- SQLite
- Zod

SQLite is file-based, completely free, requires no database server installation, and persists data in `prisma/dev.db`.

## Run on Windows PowerShell
```powershell
Copy-Item .env.example .env -Force
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API: `http://localhost:4000`
Health: `http://localhost:4000/api/health`

## View database
```powershell
npx prisma studio
```

Never commit `.env` or real secrets.
