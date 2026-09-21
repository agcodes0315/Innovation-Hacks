import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const file = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE || "./data/devflow-capstone.db"
);

fs.mkdirSync(path.dirname(file), { recursive: true });

export const db = new DatabaseSync(file);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

// Create every table used by the current application. CREATE TABLE IF NOT EXISTS
// keeps an existing internship database intact instead of deleting user data.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Developer',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Developer',
    created_at TEXT NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active'
      CHECK(status IN ('active','paused','completed')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    assignee_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo'
      CHECK(status IN ('todo','in-progress','done')),
    priority TEXT NOT NULL DEFAULT 'medium'
      CHECK(priority IN ('low','medium','high')),
    due_date TEXT,
    ai_generated INTEGER NOT NULL DEFAULT 0 CHECK(ai_generated IN (0,1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(assignee_id) REFERENCES members(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    target TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info'
      CHECK(severity IN ('info','success','warning','danger')),
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function columns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
}

function foreignKeys(table) {
  return db.prepare(`PRAGMA foreign_key_list(${table})`).all();
}

// ---------------- Legacy database migrations ----------------
// Earlier DevFlow builds had activities(id,user_id,type,message,created_at).
// Add the new optional target column without destroying existing activity data.
if (!columns("activities").includes("target")) {
  db.exec("ALTER TABLE activities ADD COLUMN target TEXT;");
}

// Earlier Task 4 builds assigned tasks directly to users. The upgraded product
// has workspace members. Create a matching member for every existing account.
const existingUsers = db.prepare(
  "SELECT id, name, email, role, created_at FROM users"
).all();

const findMemberForOwner = db.prepare(
  "SELECT id FROM members WHERE owner_id = ? ORDER BY created_at LIMIT 1"
);
const insertMember = db.prepare(`
  INSERT INTO members (id, owner_id, name, email, role, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const user of existingUsers) {
  if (!findMemberForOwner.get(user.id)) {
    insertMember.run(
      `m-self-${user.id}`,
      user.id,
      user.name,
      user.email,
      user.role || "Developer",
      user.created_at || new Date().toISOString()
    );
  }
}

// If an older tasks table points assignee_id at users(id), rebuild it once so
// future assignees correctly reference members(id). Existing task data survives.
const taskAssigneeFk = foreignKeys("tasks").find((fk) => fk.from === "assignee_id");
if (taskAssigneeFk && taskAssigneeFk.table === "users") {
  db.exec("PRAGMA foreign_keys = OFF;");
  try {
    db.exec("BEGIN;");
    db.exec(`
      CREATE TABLE tasks_migrated (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        assignee_id TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'todo'
          CHECK(status IN ('todo','in-progress','done')),
        priority TEXT NOT NULL DEFAULT 'medium'
          CHECK(priority IN ('low','medium','high')),
        due_date TEXT,
        ai_generated INTEGER NOT NULL DEFAULT 0 CHECK(ai_generated IN (0,1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY(assignee_id) REFERENCES members(id) ON DELETE SET NULL
      );

      INSERT INTO tasks_migrated (
        id, project_id, assignee_id, title, description, status, priority,
        due_date, ai_generated, created_at, updated_at
      )
      SELECT
        t.id,
        t.project_id,
        (
          SELECT m.id
          FROM members m
          WHERE m.owner_id = t.assignee_id
          ORDER BY m.created_at
          LIMIT 1
        ),
        t.title,
        COALESCE(t.description, ''),
        t.status,
        t.priority,
        t.due_date,
        COALESCE(t.ai_generated, 0),
        t.created_at,
        t.updated_at
      FROM tasks t;

      DROP TABLE tasks;
      ALTER TABLE tasks_migrated RENAME TO tasks;
      COMMIT;
    `);
  } catch (error) {
    try { db.exec("ROLLBACK;"); } catch {}
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys = ON;");
  }
}

// Re-create indexes after any possible table migration.
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_members_owner ON members(owner_id);
  CREATE INDEX IF NOT EXISTS idx_activity_user ON activities(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
`);
