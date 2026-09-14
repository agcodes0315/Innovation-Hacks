# Task 2 — Users, Projects & Tasks REST API

Express REST API for the Innovation Hacks Full Stack Development Internship.

## Features
- User CRUD
- Project CRUD and project task retrieval
- Task CRUD
- Dedicated task status endpoint
- Search/filter task endpoint
- Zod input validation
- Centralized error handling
- Correct HTTP status codes
- Environment-based configuration

## Run
```bash
npm install
copy .env.example .env
npm run dev
```

Base URL: `http://localhost:4000/api`

## Endpoints
### Users
- `GET /users`
- `POST /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Projects
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

### Tasks
- `GET /tasks?status=&projectId=&assigneeId=&q=`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/status`
- `DELETE /tasks/:id`

## Example request
```json
POST /api/users
{
  "name": "Agrima Saxena",
  "email": "agrima@example.com",
  "role": "Developer"
}
```

Task 2 intentionally uses in-memory data. Task 3 replaces this store with PostgreSQL so persistence can be demonstrated separately.
