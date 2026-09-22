import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const uid = (prefix) => `${prefix}-${randomUUID()}`;
export const now = () => new Date().toISOString();

export function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(400, "Validation failed", result.error.flatten());
  }
  return result.data;
}

export function sign(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || "dev-only-secret-change-before-deployment",
    { expiresIn: "7d" }
  );
}

export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "Authentication required"));

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-only-secret-change-before-deployment"
    );
    const user = db.prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = ?
    `).get(payload.sub);
    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function log(userId, type, message, target = null) {
  db.prepare(`
    INSERT INTO activities (id, user_id, type, message, target, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uid("a"), userId, type, message, target, now());
}

export function notify(userId, type, title, message, severity = "info") {
  db.prepare(`
    INSERT INTO notifications
      (id, user_id, type, title, message, severity, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(uid("n"), userId, type, title, message, severity, now());
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.status || 500;
  let message = err.message || "Internal server error";

  if (message.includes("UNIQUE constraint failed: users.email")) {
    status = 409;
    message = "An account with this email already exists";
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    error: {
      message: status === 500 ? "Internal server error" : message,
      ...(err.details ? { details: err.details } : {})
    }
  });
}
