import type { NextFunction, Request, Response } from "express";
import { getSupabaseUser, getAuthProfile } from "../integrations/auth";
import { ApiError } from "../shared/errors";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or malformed Authorization header");
    }

    const token = header.slice("Bearer ".length);
    const supabaseUser = await getSupabaseUser(token);
    req.user = await getAuthProfile(supabaseUser.id);

    next();
  } catch (err) {
    next(err);
  }
}
