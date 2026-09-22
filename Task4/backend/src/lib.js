import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { one, execute } from "./db.js";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const uid = (prefix) =>
  `${prefix}-${randomUUID()}`;

export const now = () =>
  new Date().toISOString();

export function parse(schema, body) {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      result.error.flatten()
    );
  }

  return result.data;
}

export function sign(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET ||
      "dev-only-secret-change-before-deployment",
    {
      expiresIn: "7d",
    }
  );
}

export async function auth(req, res, next) {
  const header =
    req.headers.authorization || "";

  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    return next(
      new HttpError(
        401,
        "Authentication required"
      )
    );
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "dev-only-secret-change-before-deployment"
    );

    const user = await one(
      `
        SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        WHERE id = $1
      `,
      [payload.sub]
    );

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    req.user = user;
    next();
  } catch {
    next(
      new HttpError(
        401,
        "Invalid or expired token"
      )
    );
  }
}

export async function log(
  userId,
  type,
  message,
  target = null
) {
  await execute(
    `
      INSERT INTO activities (
        id,
        user_id,
        type,
        message,
        target,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
    `,
    [
      uid("a"),
      userId,
      type,
      message,
      target,
      now(),
    ]
  );
}

export async function notify(
  userId,
  type,
  title,
  message,
  severity = "info"
) {
  await execute(
    `
      INSERT INTO notifications (
        id,
        user_id,
        type,
        title,
        message,
        severity,
        is_read,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        0,
        $7
      )
    `,
    [
      uid("n"),
      userId,
      type,
      title,
      message,
      severity,
      now(),
    ]
  );
}

export function errorHandler(
  err,
  req,
  res,
  next
) {
  if (res.headersSent) {
    return next(err);
  }

  let status =
    err.status || 500;

  let message =
    err.message ||
    "Internal server error";

  if (
    err.code === "23505" ||
    message.includes(
      "users_email_key"
    )
  ) {
    status = 409;
    message =
      "An account with this email already exists";
  }

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message:
        status === 500
          ? "Internal server error"
          : message,

      ...(err.details
        ? {
            details:
              err.details,
          }
        : {}),
    },
  });
}