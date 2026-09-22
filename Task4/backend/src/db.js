import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const file=path.resolve(process.cwd(),process.env.DATABASE_FILE||"./data/devflow-capstone.db");
fs.mkdirSync(path.dirname(file),{recursive:true});
export const db=new DatabaseSync(file);
db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");

db.exec(`
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'Developer',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS members(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'Developer',created_at TEXT NOT NULL,FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','paused','completed')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,assignee_id TEXT,blocked_by_task_id TEXT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN('todo','in-progress','done')),priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN('low','medium','high')),due_date TEXT,ai_generated INTEGER NOT NULL DEFAULT 0 CHECK(ai_generated IN(0,1)),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,FOREIGN KEY(assignee_id) REFERENCES members(id) ON DELETE SET NULL,FOREIGN KEY(blocked_by_task_id) REFERENCES tasks(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS activities(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,type TEXT NOT NULL,message TEXT NOT NULL,target TEXT,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,type TEXT NOT NULL,title TEXT NOT NULL,message TEXT NOT NULL,severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN('info','success','warning','danger')),is_read INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS preferences(user_id TEXT PRIMARY KEY,browser_notifications INTEGER NOT NULL DEFAULT 1,email_reminders INTEGER NOT NULL DEFAULT 0,daily_briefing INTEGER NOT NULL DEFAULT 1,weekly_summary INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS reminder_log(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,task_id TEXT,kind TEXT NOT NULL,channel TEXT NOT NULL,sent_at TEXT NOT NULL,UNIQUE(user_id,task_id,kind,channel),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS digest_log(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,kind TEXT NOT NULL,date_key TEXT NOT NULL,sent_at TEXT NOT NULL,UNIQUE(user_id,kind,date_key),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
`);

const cols=t=>db.prepare(`PRAGMA table_info(${t})`).all().map(r=>r.name);
if(!cols("activities").includes("target"))db.exec("ALTER TABLE activities ADD COLUMN target TEXT;");
if(!cols("tasks").includes("blocked_by_task_id"))db.exec("ALTER TABLE tasks ADD COLUMN blocked_by_task_id TEXT;");

// Migrate older task assignees that referenced users instead of workspace members.
const fk=db.prepare("PRAGMA foreign_key_list(tasks)").all().find(x=>x.from==="assignee_id");
const users=db.prepare("SELECT id,name,email,role,created_at FROM users").all();
const findMember=db.prepare("SELECT id FROM members WHERE owner_id=? ORDER BY created_at LIMIT 1");
const addMember=db.prepare("INSERT INTO members(id,owner_id,name,email,role,created_at) VALUES(?,?,?,?,?,?)");
for(const u of users){if(!findMember.get(u.id))addMember.run(`m-self-${u.id}`,u.id,u.name,u.email,u.role||"Developer",u.created_at||new Date().toISOString());}
if(fk&&fk.table==="users"){
  db.exec("PRAGMA foreign_keys=OFF;");
  try{
    db.exec("BEGIN;");
    db.exec(`CREATE TABLE tasks_migrated(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,assignee_id TEXT,blocked_by_task_id TEXT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN('todo','in-progress','done')),priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN('low','medium','high')),due_date TEXT,ai_generated INTEGER NOT NULL DEFAULT 0 CHECK(ai_generated IN(0,1)),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,FOREIGN KEY(assignee_id) REFERENCES members(id) ON DELETE SET NULL,FOREIGN KEY(blocked_by_task_id) REFERENCES tasks_migrated(id) ON DELETE SET NULL);`);
    db.exec(`INSERT INTO tasks_migrated(id,project_id,assignee_id,blocked_by_task_id,title,description,status,priority,due_date,ai_generated,created_at,updated_at)
      SELECT t.id,t.project_id,(SELECT m.id FROM members m WHERE m.owner_id=t.assignee_id ORDER BY m.created_at LIMIT 1),NULL,t.title,COALESCE(t.description,''),t.status,t.priority,t.due_date,COALESCE(t.ai_generated,0),t.created_at,t.updated_at FROM tasks t;`);
    db.exec("DROP TABLE tasks; ALTER TABLE tasks_migrated RENAME TO tasks; COMMIT;");
  }catch(e){try{db.exec("ROLLBACK;")}catch{}throw e}finally{db.exec("PRAGMA foreign_keys=ON;");}
}

// Ensure every user has preferences.
const prefInsert=db.prepare("INSERT OR IGNORE INTO preferences(user_id,updated_at) VALUES(?,?)");
for(const u of users)prefInsert.run(u.id,new Date().toISOString());

db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);CREATE INDEX IF NOT EXISTS idx_tasks_blocked_by ON tasks(blocked_by_task_id);CREATE INDEX IF NOT EXISTS idx_members_owner ON members(owner_id);CREATE INDEX IF NOT EXISTS idx_activity_user ON activities(user_id);CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`);
