import { randomUUID } from "node:crypto";
import { db } from "./db.js";

const count = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

if (count === 0) {
  const now = new Date().toISOString();
  const userId = `u-${randomUUID()}`;
  const projectId = `p-${randomUUID()}`;

  db.prepare(`
    INSERT INTO users (id, name, email, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, "Agrima Saxena", "agrima@example.com", "Developer", now);

  db.prepare(`
    INSERT INTO projects
      (id, name, description, owner_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    "DevFlow Persistent API",
    "Task 3 demonstration project stored in SQLite.",
    userId,
    "active",
    now,
    now
  );

  db.prepare(`
    INSERT INTO tasks
      (id, project_id, assignee_id, title, description, status, priority, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `t-${randomUUID()}`,
    projectId,
    userId,
    "Verify persistent CRUD",
    "Create, update and restart the API to prove data persists.",
    "in-progress",
    "high",
    null,
    now,
    now
  );
}
