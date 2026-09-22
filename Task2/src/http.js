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

export function notFound(label) {
  throw new HttpError(404, `${label} not found`);
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: status === 500 ? "Internal server error" : err.message,
      ...(err.details ? { details: err.details } : {})
    }
  });
}
