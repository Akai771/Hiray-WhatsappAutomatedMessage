import type { NextFunction, Request, Response } from "express";
import type { Role } from "../shared/constants";
import { ApiError } from "../shared/errors";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}
