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

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let normalized = err;
  const message = String(err.message || "");
  if (message.includes("UNIQUE constraint failed: users.email")) {
    normalized = new HttpError(409, "An account with this email already exists");
  } else if (message.includes("FOREIGN KEY constraint failed")) {
    normalized = new HttpError(409, "Operation conflicts with related data");
  }

  const status = normalized.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    error: {
      message: status === 500 ? "Internal server error" : normalized.message,
      ...(normalized.details ? { details: normalized.details } : {})
    }
  });
}
