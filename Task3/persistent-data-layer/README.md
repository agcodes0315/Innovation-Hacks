# Task 3 — Persistent Data Layer

This task uses **SQLite directly through Node.js**. No ORM and no external database service are required.

## Requirements

- Node.js 22.5+
- npm

## Run

```powershell
Copy-Item .env.example .env -Force
npm install
npm run dev
```

The database is created automatically at:

```text
data/devflow.db
```

## Persistence demo

1. Create a task with `POST /api/tasks`.
2. Stop the API with `Ctrl+C`.
3. Start it again with `npm run dev`.
4. `GET /api/tasks` still returns the task.

## Database relationships

- User `1 -> many` Projects
- Project `1 -> many` Tasks
- User `1 -> many` assigned Tasks
- Deleting a project cascades to its tasks.
- Deleting a user is restricted while they own projects.
- Deleting an assignee sets task assignment to `NULL`.

## Reset local database

```powershell
npm run reset-db
```
