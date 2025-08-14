import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { AppError } from "./errorHandler";

export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Validation failed", 400, err.issues));
      }
      next(err);
    }
  };
}

export function validateQuery(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Validation failed", 400, err.issues));
      }
      next(err);
    }
  };
}

export function validateParams(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Validation failed", 400, err.issues));
      }
      next(err);
    }
  };
}
