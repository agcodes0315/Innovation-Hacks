import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  users,
  projects,
  tasks,
  createId,
  timestamp
} from "./store.js";
import {
  userCreateSchema,
  userUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema
} from "./schemas.js";
import { HttpError, parse, notFound, errorHandler } from "./http.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    task: 2,
    persistence: "in-memory",
    timestamp: new Date().toISOString()
  });
});

// USERS
app.get("/api/users", (req, res) => res.json(users));

app.get("/api/users/:id", (req, res) => {
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return notFound("User");
  res.json(user);
});

app.post("/api/users", (req, res) => {
  const input = parse(userCreateSchema, req.body);
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new HttpError(409, "A user with this email already exists");
  }
  const user = { id: createId("u"), ...input, createdAt: timestamp() };
  users.push(user);
  res.status(201).json(user);
});

app.patch("/api/users/:id", (req, res) => {
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("User");
  const input = parse(userUpdateSchema, req.body);
  if (input.email && users.some((u, i) => i !== index && u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new HttpError(409, "A user with this email already exists");
  }
  users[index] = { ...users[index], ...input };
  res.json(users[index]);
});

app.delete("/api/users/:id", (req, res) => {
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("User");
  if (projects.some((p) => p.ownerId === req.params.id)) {
    throw new HttpError(409, "Delete or reassign this user's projects first");
  }
  users.splice(index, 1);
  res.status(204).end();
});

// PROJECTS
app.get("/api/projects", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const status = req.query.status;
  const result = projects.filter((p) => {
    const matchesQ = !q || `${p.name} ${p.description}`.toLowerCase().includes(q);
    const matchesStatus = !status || p.status === status;
    return matchesQ && matchesStatus;
  });
  res.json(result);
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return notFound("Project");
  res.json({
    ...project,
    tasks: tasks.filter((task) => task.projectId === project.id)
  });
});

app.post("/api/projects", (req, res) => {
  const input = parse(projectCreateSchema, req.body);
  if (!users.some((u) => u.id === input.ownerId)) {
    throw new HttpError(400, "ownerId does not reference an existing user");
  }
  const project = {
    id: createId("p"),
    ...input,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
  projects.push(project);
  res.status(201).json(project);
});

app.patch("/api/projects/:id", (req, res) => {
  const index = projects.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("Project");
  const input = parse(projectUpdateSchema, req.body);
  if (input.ownerId && !users.some((u) => u.id === input.ownerId)) {
    throw new HttpError(400, "ownerId does not reference an existing user");
  }
  projects[index] = {
    ...projects[index],
    ...input,
    updatedAt: timestamp()
  };
  res.json(projects[index]);
});

app.delete("/api/projects/:id", (req, res) => {
  const index = projects.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("Project");
  projects.splice(index, 1);
  for (let i = tasks.length - 1; i >= 0; i -= 1) {
    if (tasks[i].projectId === req.params.id) tasks.splice(i, 1);
  }
  res.status(204).end();
});

// TASKS
app.get("/api/tasks", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const { status, priority, projectId } = req.query;
  const result = tasks.filter((task) => {
    return (
      (!q || `${task.title} ${task.description}`.toLowerCase().includes(q)) &&
      (!status || task.status === status) &&
      (!priority || task.priority === priority) &&
      (!projectId || task.projectId === projectId)
    );
  });
  res.json(result);
});

app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);
  if (!task) return notFound("Task");
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const input = parse(taskCreateSchema, req.body);
  if (!projects.some((p) => p.id === input.projectId)) {
    throw new HttpError(400, "projectId does not reference an existing project");
  }
  if (input.assigneeId && !users.some((u) => u.id === input.assigneeId)) {
    throw new HttpError(400, "assigneeId does not reference an existing user");
  }
  const task = {
    id: createId("t"),
    ...input,
    assigneeId: input.assigneeId ?? null,
    dueDate: input.dueDate ?? null,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id/status", (req, res) => {
  const index = tasks.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("Task");
  const input = parse(taskStatusSchema, req.body);
  tasks[index] = { ...tasks[index], ...input, updatedAt: timestamp() };
  res.json(tasks[index]);
});

app.patch("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("Task");
  const input = parse(taskUpdateSchema, req.body);
  if (input.projectId && !projects.some((p) => p.id === input.projectId)) {
    throw new HttpError(400, "projectId does not reference an existing project");
  }
  if (input.assigneeId && !users.some((u) => u.id === input.assigneeId)) {
    throw new HttpError(400, "assigneeId does not reference an existing user");
  }
  tasks[index] = { ...tasks[index], ...input, updatedAt: timestamp() };
  res.json(tasks[index]);
});

app.delete("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex((item) => item.id === req.params.id);
  if (index < 0) return notFound("Task");
  tasks.splice(index, 1);
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Task 2 API running at http://localhost:${port}`);
});
