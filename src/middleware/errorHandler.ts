import { ErrorRequestHandler } from "express";
import logger from "../lib/logger";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;
  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as any).statusCode || 500;
  const code = (err as any).code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Something went wrong";

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");

  if (process.env.NODE_ENV !== "production") {
    return res.status(status).json({
      code,
      message,
      details: (err as any).details,
      stack: err.stack,
    });
  }

  return res.status(status).json({ code, message });
};
