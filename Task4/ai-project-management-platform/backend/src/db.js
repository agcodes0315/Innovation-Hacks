import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
const file=path.resolve(process.cwd(),process.env.DATABASE_FILE||"./data/devflow-capstone.db");
fs.mkdirSync(path.dirname(file),{recursive:true});
export const db=new DatabaseSync(file);
db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");
db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'Developer',created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS members(
 id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'Developer',created_at TEXT NOT NULL,
 FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS projects(
 id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','paused','completed')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
 FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tasks(
 id TEXT PRIMARY KEY,project_id TEXT NOT NULL,assignee_id TEXT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN('todo','in-progress','done')),priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN('low','medium','high')),due_date TEXT,ai_generated INTEGER NOT NULL DEFAULT 0 CHECK(ai_generated IN(0,1)),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
 FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
 FOREIGN KEY(assignee_id) REFERENCES members(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS activities(
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL,type TEXT NOT NULL,message TEXT NOT NULL,target TEXT,created_at TEXT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS notifications(
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL,type TEXT NOT NULL,title TEXT NOT NULL,message TEXT NOT NULL,severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN('info','success','warning','danger')),is_read INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_members_owner ON members(owner_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
`);
