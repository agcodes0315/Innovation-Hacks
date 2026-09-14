import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { HttpError, parse, errorHandler } from "./http.js";
import { requireAuth, signToken } from "./auth.js";
import {
  registerSchema,
  loginSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
  aiGenerateSchema
} from "./schemas.js";
import { logActivity } from "./activity.js";
import { generateTasksWithLocalAI } from "./ai.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${randomUUID()}`;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    task: 4,
    database: "SQLite",
    auth: "JWT",
    ai: "Ollama local with fallback planner",
    timestamp: now()
  });
});

// AUTH
app.post("/api/auth/register", async (req, res) => {
  const input = parse(registerSchema, req.body);
  const exists = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(input.email);
  if (exists) throw new HttpError(409, "An account with this email already exists");

  const userId = id("u");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const created = now();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, input.name, input.email, passwordHash, "Developer", created);

  const user = db.prepare(`
    SELECT id, name, email, role, created_at FROM users WHERE id = ?
  `).get(userId);

  logActivity(userId, "account", "Created a DevFlow account");
  res.status(201).json({ token: signToken(user), user });
});

app.post("/api/auth/login", async (req, res) => {
  const input = parse(loginSchema, req.body);
  const record = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(input.email);
  if (!record || !(await bcrypt.compare(input.password, record.password_hash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const user = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    created_at: record.created_at
  };
  logActivity(user.id, "account", "Signed in");
  res.json({ token: signToken(user), user });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json(req.user);
});

// DASHBOARD
app.get("/api/dashboard", requireAuth, (req, res) => {
  const userId = req.user.id;

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM projects WHERE owner_id = ?) AS project_count,
      (SELECT COUNT(*) FROM tasks t
        JOIN projects p ON p.id = t.project_id
        WHERE p.owner_id = ?) AS task_count,
      (SELECT COUNT(*) FROM tasks t
        JOIN projects p ON p.id = t.project_id
        WHERE p.owner_id = ? AND t.status = 'done') AS completed_count,
      (SELECT COUNT(*) FROM tasks t
        JOIN projects p ON p.id = t.project_id
        WHERE p.owner_id = ? AND t.status = 'in-progress') AS in_progress_count
  `).get(userId, userId, userId, userId);

  const activities = db.prepare(`
    SELECT * FROM activities
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 8
  `).all(userId);

  res.json({ stats, activities });
});

// PROJECTS
app.get("/api/projects", requireAuth, (req, res) => {
  const q = `%${String(req.query.q || "")}%`;
  const status = req.query.status || null;

  const rows = db.prepare(`
    SELECT p.*,
      COUNT(t.id) AS task_count,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE p.owner_id = ?
      AND (? = '%%' OR p.name LIKE ? OR p.description LIKE ?)
      AND (? IS NULL OR p.status = ?)
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `).all(req.user.id, q, q, q, status, status);

  res.json(rows);
});

app.get("/api/projects/:id", requireAuth, (req, res) => {
  const project = db.prepare(`
    SELECT p.*,
      COUNT(t.id) AS task_count,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE p.id = ? AND p.owner_id = ?
    GROUP BY p.id
  `).get(req.params.id, req.user.id);

  if (!project) throw new HttpError(404, "Project not found");

  const tasks = db.prepare(`
    SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC
  `).all(project.id);

  res.json({ ...project, tasks });
});

app.post("/api/projects", requireAuth, (req, res) => {
  const input = parse(projectCreateSchema, req.body);
  const projectId = id("p");
  const created = now();

  db.prepare(`
    INSERT INTO projects
      (id, owner_id, name, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    req.user.id,
    input.name,
    input.description,
    input.status,
    created,
    created
  );

  logActivity(req.user.id, "project", `Created project "${input.name}"`);
  res.status(201).json(db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId));
});

app.patch("/api/projects/:id", requireAuth, (req, res) => {
  const current = db.prepare(`
    SELECT * FROM projects WHERE id = ? AND owner_id = ?
  `).get(req.params.id, req.user.id);
  if (!current) throw new HttpError(404, "Project not found");

  const input = parse(projectUpdateSchema, req.body);
  const next = {
    name: input.name ?? current.name,
    description: input.description ?? current.description,
    status: input.status ?? current.status
  };

  db.prepare(`
    UPDATE projects
    SET name = ?, description = ?, status = ?, updated_at = ?
    WHERE id = ? AND owner_id = ?
  `).run(next.name, next.description, next.status, now(), req.params.id, req.user.id);

  logActivity(req.user.id, "project", `Updated project "${next.name}"`);
  res.json(db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id));
});

app.delete("/api/projects/:id", requireAuth, (req, res) => {
  const current = db.prepare(`
    SELECT * FROM projects WHERE id = ? AND owner_id = ?
  `).get(req.params.id, req.user.id);
  if (!current) throw new HttpError(404, "Project not found");

  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  logActivity(req.user.id, "project", `Deleted project "${current.name}"`);
  res.status(204).end();
});

// TASKS
app.get("/api/tasks", requireAuth, (req, res) => {
  const q = `%${String(req.query.q || "")}%`;
  const status = req.query.status || null;
  const priority = req.query.priority || null;
  const projectId = req.query.projectId || null;

  const rows = db.prepare(`
    SELECT t.*, p.name AS project_name
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE p.owner_id = ?
      AND (? = '%%' OR t.title LIKE ? OR t.description LIKE ?)
      AND (? IS NULL OR t.status = ?)
      AND (? IS NULL OR t.priority = ?)
      AND (? IS NULL OR t.project_id = ?)
    ORDER BY
      CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      t.created_at DESC
  `).all(
    req.user.id,
    q, q, q,
    status, status,
    priority, priority,
    projectId, projectId
  );

  res.json(rows);
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const input = parse(taskCreateSchema, req.body);
  const project = db.prepare(`
    SELECT * FROM projects WHERE id = ? AND owner_id = ?
  `).get(input.projectId, req.user.id);
  if (!project) throw new HttpError(404, "Project not found");

  const taskId = id("t");
  const created = now();
  db.prepare(`
    INSERT INTO tasks
      (id, project_id, assignee_id, title, description, status, priority, due_date,
       ai_generated, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    taskId,
    project.id,
    req.user.id,
    input.title,
    input.description,
    input.status,
    input.priority,
    input.dueDate || null,
    created,
    created
  );

  logActivity(req.user.id, "task", `Created task "${input.title}"`);
  res.status(201).json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId));
});

app.patch("/api/tasks/:id", requireAuth, (req, res) => {
  const current = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = ? AND p.owner_id = ?
  `).get(req.params.id, req.user.id);
  if (!current) throw new HttpError(404, "Task not found");

  const input = parse(taskUpdateSchema, req.body);
  const nextProjectId = input.projectId ?? current.project_id;
  const project = db.prepare(`
    SELECT id FROM projects WHERE id = ? AND owner_id = ?
  `).get(nextProjectId, req.user.id);
  if (!project) throw new HttpError(404, "Project not found");

  const next = {
    title: input.title ?? current.title,
    description: input.description ?? current.description,
    status: input.status ?? current.status,
    priority: input.priority ?? current.priority,
    dueDate: input.dueDate !== undefined ? input.dueDate : current.due_date
  };

  db.prepare(`
    UPDATE tasks
    SET project_id = ?, title = ?, description = ?, status = ?, priority = ?,
        due_date = ?, updated_at = ?
    WHERE id = ?
  `).run(
    nextProjectId,
    next.title,
    next.description,
    next.status,
    next.priority,
    next.dueDate || null,
    now(),
    req.params.id
  );

  logActivity(req.user.id, "task", `Updated task "${next.title}"`);
  res.json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id));
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  const current = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = ? AND p.owner_id = ?
  `).get(req.params.id, req.user.id);
  if (!current) throw new HttpError(404, "Task not found");

  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  logActivity(req.user.id, "task", `Deleted task "${current.title}"`);
  res.status(204).end();
});

// AI TASK GENERATION
app.post("/api/ai/generate-tasks", requireAuth, async (req, res) => {
  const input = parse(aiGenerateSchema, req.body);
  const project = db.prepare(`
    SELECT * FROM projects WHERE id = ? AND owner_id = ?
  `).get(input.projectId, req.user.id);
  if (!project) throw new HttpError(404, "Project not found");

  const result = await generateTasksWithLocalAI(project, input.count);
  const created = now();
  const insert = db.prepare(`
    INSERT INTO tasks
      (id, project_id, assignee_id, title, description, status, priority, due_date,
       ai_generated, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'todo', ?, NULL, ?, ?, ?)
  `);

  const saved = [];
  db.exec("BEGIN");
  try {
    for (const task of result.tasks) {
      const taskId = id("t");
      insert.run(
        taskId,
        project.id,
        req.user.id,
        task.title,
        task.description,
        task.priority,
        result.mode === "local-ai" ? 1 : 0,
        created,
        created
      );
      saved.push(db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId));
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const label = result.mode === "local-ai" ? "local AI" : "fallback planner";
  logActivity(req.user.id, "ai", `Generated ${saved.length} tasks for "${project.name}" using ${label}`);

  res.status(201).json({
    mode: result.mode,
    model: result.model,
    tasks: saved,
    message: result.mode === "local-ai"
      ? "Tasks generated by your local Ollama model."
      : "Ollama was unavailable, so the built-in fallback planner was used. Start Ollama for a genuine local AI demo."
  });
});

app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Task 4 backend running at http://localhost:${port}`);
});
