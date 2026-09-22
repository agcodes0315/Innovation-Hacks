export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, "Validation failed", result.error.flatten());
  }
  return result.data;
}

export function sqliteError(err) {
  const message = String(err.message || "");
  if (message.includes("UNIQUE constraint failed: users.email")) {
    return new HttpError(409, "A user with this email already exists");
  }
  if (message.includes("FOREIGN KEY constraint failed")) {
    return new HttpError(409, "Operation conflicts with an existing relationship");
  }
  return err;
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const normalized = sqliteError(err);
  const status = normalized.status || 500;
  res.status(status).json({
    error: {
      message: status === 500 ? "Internal server error" : normalized.message,
      ...(normalized.details ? { details: normalized.details } : {})
    }
  });
}
