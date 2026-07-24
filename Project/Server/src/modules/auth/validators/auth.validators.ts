import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const resetPasswordParamsSchema = z.object({
  id: z.uuid(),
});

export const resetPasswordBodySchema = z.object({
  newPassword: z.string().min(8),
});
