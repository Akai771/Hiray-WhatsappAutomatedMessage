import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../shared/errors";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) return next(ApiError.badRequest("Invalid request body", result.error.issues));
      req.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) return next(ApiError.badRequest("Invalid query parameters", result.error.issues));
      // req.query is a getter re-parsed from req.url on every access in
      // Express 5 (no setter) — Object.assign onto it would silently not
      // persist, so the property itself must be replaced.
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) return next(ApiError.badRequest("Invalid route parameters", result.error.issues));
      Object.assign(req.params, result.data);
    }

    next();
  };
}
