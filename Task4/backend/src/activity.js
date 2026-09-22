import { randomUUID } from "node:crypto";
import { db } from "./db.js";

export function logActivity(userId, type, message) {
  db.prepare(`
    INSERT INTO activities (id, user_id, type, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    `a-${randomUUID()}`,
    userId,
    type,
    message,
    new Date().toISOString()
  );
}
