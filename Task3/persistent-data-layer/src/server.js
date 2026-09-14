import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import "./seed.js";
import {
  userCreateSchema,
  userUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema
} from "./schemas.js";
import { HttpError, parse, errorHandler } from "./http.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${randomUUID()}`;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

function mustGet(sql, params, label) {
  const row = db.prepare(sql).get(...params);
  if (!row) throw new HttpError(404, `${label} not found`);
  return row;
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    task: 3,
    database: "SQLite",
    persistence: true,
    timestamp: now()
  });
});

// USERS
app.get("/api/users", (req, res) => {
  res.json(db.prepare("SELECT * FROM users ORDER BY created_at DESC").all());
});

app.get("/api/users/:id", (req, res) => {
  res.json(mustGet("SELECT * FROM users WHERE id = ?", [req.params.id], "User"));
});

app.post("/api/users", (req, res) => {
  const input = parse(userCreateSchema, req.body);
  const row = {
    id: id("u"),
    ...input,
    createdAt: now()
  };
  db.prepare(`
    INSERT INTO users (id, name, email, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(row.id, row.name, row.email, row.role, row.createdAt);
  res.status(201).json(row);
});

app.patch("/api/users/:id", (req, res) => {
  const current = mustGet("SELECT * FROM users WHERE id = ?", [req.params.id], "User");
  const input = parse(userUpdateSchema, req.body);
  const next = {
    name: input.name ?? current.name,
    email: input.email ?? current.email,
    role: input.role ?? current.role
  };
  db.prepare(`
    UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?
  `).run(next.name, next.email, next.role, req.params.id);
  res.json(db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id));
});

app.delete("/api/users/:id", (req, res) => {
  mustGet("SELECT * FROM users WHERE id = ?", [req.params.id], "User");
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// PROJECTS
app.get("/api/projects", (req, res) => {
  const q = `%${String(req.query.q || "")}%`;
  const status = req.query.status || null;
  const rows = db.prepare(`
    SELECT p.*,
      u.name AS owner_name,
      COUNT(t.id) AS task_count,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done_count
    FROM projects p
    JOIN users u ON u.id = p.owner_id
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE (? = '%%' OR p.name LIKE ? OR p.description LIKE ?)
      AND (? IS NULL OR p.status = ?)
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(q, q, q, status, status);
  res.json(rows);
});

app.get("/api/projects/:id", (req, res) => {
  const project = mustGet(`
    SELECT p.*, u.name AS owner_name
    FROM projects p
    JOIN users u ON u.id = p.owner_id
    WHERE p.id = ?
  `, [req.params.id], "Project");

  const projectTasks = db.prepare(`
    SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC
  `).all(req.params.id);

  res.json({ ...project, tasks: projectTasks });
});

app.post("/api/projects", (req, res) => {
  const input = parse(projectCreateSchema, req.body);
  mustGet("SELECT id FROM users WHERE id = ?", [input.ownerId], "Owner");
  const projectId = id("p");
  const created = now();
  db.prepare(`
    INSERT INTO projects
      (id, name, description, owner_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(projectId, input.name, input.description, input.ownerId, input.status, created, created);
  res.status(201).json(db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId));
});

app.patch("/api/projects/:id", (req, res) => {
  const current = mustGet("SELECT * FROM projects WHERE id = ?", [req.params.id], "Project");
  const input = parse(projectUpdateSchema, req.body);
  const next = {
    name: input.name ?? current.name,
    description: input.description ?? current.description,
    ownerId: input.ownerId ?? current.owner_id,
    status: input.status ?? current.status
  };
  mustGet("SELECT id FROM users WHERE id = ?", [next.ownerId], "Owner");
  db.prepare(`
    UPDATE projects
    SET name = ?, description = ?, owner_id = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(next.name, next.description, next.ownerId, next.status, now(), req.params.id);
  res.json(db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id));
});

app.delete("/api/projects/:id", (req, res) => {
  mustGet("SELECT id FROM projects WHERE id = ?", [req.params.id], "Project");
  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// TASKS
app.get("/api/tasks", (req, res) => {
  const q = `%${String(req.query.q || "")}%`;
  const status = req.query.status || null;
  const priority = req.query.priority || null;
  const projectId = req.query.projectId || null;

  const rows = db.prepare(`
    SELECT t.*, p.name AS project_name, u.name AS assignee_name
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN users u ON u.id = t.assignee_id
    WHERE (? = '%%' OR t.title LIKE ? OR t.description LIKE ?)
      AND (? IS NULL OR t.status = ?)
      AND (? IS NULL OR t.priority = ?)
      AND (? IS NULL OR t.project_id = ?)
    ORDER BY t.created_at DESC
  `).all(
    q, q, q,
    status, status,
    priority, priority,
    projectId, projectId
  );
  res.json(rows);
});

app.get("/api/tasks/:id", (req, res) => {
  res.json(mustGet("SELECT * FROM tasks WHERE id = ?", [req.params.id], "Task"));
});

app.post("/api/tasks", (req, res) => {
  const input = parse(taskCreateSchema, req.body);
  mustGet("SELECT id FROM projects WHERE id = ?", [input.projectId], "Project");
  if (input.assigneeId) mustGet("SELECT id FROM users WHERE id = ?", [input.assigneeId], "Assignee");

  const taskId = id("t");
  const created = now();
  db.prepare(`
    INSERT INTO tasks
      (id, project_id, assignee_id, title, description, status, priority, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    taskId,
    input.projectId,
    input.assigneeId ?? null,
    input.title,
    input.description,
    input.status,
    input.priority,
    input.dueDate ?? null,
    created,
    created
  );
  res.status(201).json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId));
});

app.patch("/api/tasks/:id/status", (req, res) => {
  mustGet("SELECT id FROM tasks WHERE id = ?", [req.params.id], "Task");
  const input = parse(taskStatusSchema, req.body);
  db.prepare(`
    UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?
  `).run(input.status, now(), req.params.id);
  res.json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id));
});

app.patch("/api/tasks/:id", (req, res) => {
  const current = mustGet("SELECT * FROM tasks WHERE id = ?", [req.params.id], "Task");
  const input = parse(taskUpdateSchema, req.body);
  const next = {
    projectId: input.projectId ?? current.project_id,
    assigneeId: input.assigneeId !== undefined ? input.assigneeId : current.assignee_id,
    title: input.title ?? current.title,
    description: input.description ?? current.description,
    status: input.status ?? current.status,
    priority: input.priority ?? current.priority,
    dueDate: input.dueDate !== undefined ? input.dueDate : current.due_date
  };
  mustGet("SELECT id FROM projects WHERE id = ?", [next.projectId], "Project");
  if (next.assigneeId) mustGet("SELECT id FROM users WHERE id = ?", [next.assigneeId], "Assignee");

  db.prepare(`
    UPDATE tasks
    SET project_id = ?, assignee_id = ?, title = ?, description = ?, status = ?,
        priority = ?, due_date = ?, updated_at = ?
    WHERE id = ?
  `).run(
    next.projectId,
    next.assigneeId,
    next.title,
    next.description,
    next.status,
    next.priority,
    next.dueDate,
    now(),
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id));
});

app.delete("/api/tasks/:id", (req, res) => {
  mustGet("SELECT id FROM tasks WHERE id = ?", [req.params.id], "Task");
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Task 3 persistent API running at http://localhost:${port}`);
  console.log(`SQLite file: ${process.env.DATABASE_FILE || "./data/devflow.db"}`);
});
