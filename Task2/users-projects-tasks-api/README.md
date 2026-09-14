# Task 2 — Users, Projects & Tasks REST API

## Run

```powershell
Copy-Item .env.example .env -Force
npm install
npm run dev
```

Health check: `http://localhost:4000/api/health`

## Endpoints

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Projects
- `GET /api/projects?q=&status=`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks
- `GET /api/tasks?q=&status=&priority=&projectId=`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

Task 2 intentionally stores data in memory. Task 3 adds persistence.

## Example task create body

```json
{
  "projectId": "p-demo",
  "assigneeId": "u-demo",
  "title": "Add API documentation",
  "description": "Document all routes and examples.",
  "status": "todo",
  "priority": "high",
  "dueDate": null
}
```
