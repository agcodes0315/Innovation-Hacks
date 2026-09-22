import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Connect Neon to this Vercel project."
  );
}

export const pool = new Pool({
  connectionString,
  ssl:
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
      ? false
      : {
          rejectUnauthorized: false,
        },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

export async function one(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}

export async function many(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function execute(text, params = []) {
  const result = await pool.query(text, params);

  return {
    rowCount: result.rowCount,
    rows: result.rows,
  };
}

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function initializeDatabase() {
  await pool.query(`
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
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      assignee_id TEXT,
      blocked_by_task_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      ai_generated INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      target TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT PRIMARY KEY,
      browser_notifications INTEGER NOT NULL DEFAULT 0,
      email_reminders INTEGER NOT NULL DEFAULT 0,
      daily_briefing INTEGER NOT NULL DEFAULT 0,
      weekly_summary INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminder_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      channel TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      UNIQUE(user_id, task_id, kind, channel)
    );

    CREATE TABLE IF NOT EXISTS digest_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      date_key TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      UNIQUE(user_id, kind, date_key)
    );

    CREATE INDEX IF NOT EXISTS idx_projects_owner
    ON projects(owner_id);

    CREATE INDEX IF NOT EXISTS idx_tasks_project
    ON tasks(project_id);

    CREATE INDEX IF NOT EXISTS idx_members_owner
    ON members(owner_id);

    CREATE INDEX IF NOT EXISTS idx_activities_user
    ON activities(user_id);

    CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id);
  `);
}

await initializeDatabase();

export const db = {
  query,
  one,
  many,
  execute,
  withTransaction,
};

export default db;