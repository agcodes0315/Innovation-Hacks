import { Prisma } from "@prisma/client";
export function notFound(req, res) { res.status(404).json({ success: false, error: { message: "Route not found" } }); }
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return res.status(409).json({ success: false, error: { message: "A unique value already exists" } });
  res.status(error.status || 500).json({ success: false, error: { message: error.message || "Internal server error", ...(error.details ? { details: error.details } : {}) } });
}
