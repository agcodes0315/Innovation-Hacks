export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = error.status || 500;
  res.status(status).json({
    success: false,
    error: {
      message: error.message || "Internal server error",
      ...(error.details ? { details: error.details } : {}),
    },
  });
}
