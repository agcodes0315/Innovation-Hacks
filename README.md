# Innovation Hacks — Tasks 2, 3 and 4

This package is intentionally simple: **no Prisma, no pgAdmin, no Neon, no MongoDB Atlas**.

## Stack

- Task 2: Node.js + Express + Zod (in-memory REST API)
- Task 3: Node.js + Express + built-in SQLite (`node:sqlite`)
- Task 4: React + Vite + Express + built-in SQLite + JWT + bcryptjs + optional local Ollama AI

## Requirement

Use **Node.js 22.5+** because Tasks 3 and 4 use Node's built-in `node:sqlite` module.

Check:

```powershell
node -v
```

## Folder layout

```text
Task2/
  users-projects-tasks-api/

Task3/
  persistent-data-layer/

Task4/
  ai-project-management-platform/
    backend/
    frontend/
```

Each task has its own README with exact run commands.

## Important

Do not commit `.env` files or generated SQLite database files. `.env.example` files are included.
