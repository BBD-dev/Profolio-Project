import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type MongoDupError = Error & { code?: number; keyValue?: Record<string, unknown> };

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ detail: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;

  if (err instanceof AppError) {
    return res.status(err.status).json({ detail: err.message });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ detail: `Invalid ${err.path || "identifier"}` });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ detail: first?.message || "Validation failed" });
  }

  const dup = err as MongoDupError;
  if (dup && dup.code === 11000) {
    const field = dup.keyValue ? Object.keys(dup.keyValue)[0] : "value";
    return res.status(409).json({ detail: `This ${field} is already in use` });
  }

  if (err instanceof SyntaxError && "body" in (err as object)) {
    return res.status(400).json({ detail: "Malformed JSON body" });
  }

  const e = err as Error & { status?: number; statusCode?: number; type?: string };
  if (e?.type === "entity.too.large") {
    return res.status(413).json({ detail: "Request body is too large" });
  }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  const status = typeof e?.status === "number" ? e.status : typeof e?.statusCode === "number" ? e.statusCode : 500;
  const detail =
    status >= 500
      ? env.nodeEnv === "production"
        ? "Internal server error"
        : e?.message || "Internal server error"
      : e?.message || "Request failed";
  return res.status(status).json({ detail });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
