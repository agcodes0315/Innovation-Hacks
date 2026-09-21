import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
const file=path.resolve(process.cwd(),process.env.DATABASE_FILE||"./data/devflow.db");
fs.mkdirSync(path.dirname(file),{recursive:true});
export const db=new DatabaseSync(file);
db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL CHECK(length(name)>=2),email TEXT NOT NULL UNIQUE,role TEXT NOT NULL DEFAULT 'Developer',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',owner_id TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','paused','completed')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE RESTRICT);
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,assignee_id TEXT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN('todo','in-progress','done')),priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN('low','medium','high')),due_date TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,FOREIGN KEY(assignee_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
`);
const count=db.prepare("SELECT COUNT(*) c FROM users").get().c;
if(!count){
 const now=new Date().toISOString();
 db.prepare("INSERT INTO users VALUES(?,?,?,?,?)").run("u-demo","Agrima Saxena","agrima@example.com","Developer",now);
 db.prepare("INSERT INTO projects VALUES(?,?,?,?,?,?,?)").run("p-demo","Persistent DevFlow","SQLite-backed project","u-demo","active",now,now);
 db.prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?)").run("t-demo","p-demo","u-demo","Persistence proof","Restart the API and verify this row remains","in-progress","high",null,now,now);
}
