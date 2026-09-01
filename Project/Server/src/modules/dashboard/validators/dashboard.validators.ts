import { z } from "zod";

export const analyticsQuerySchema = z.object({
  // "all" (or omitted) = every college; a specific branch id scopes the
  // whole analytics response to that college. Faculty ignore this — their
  // own branch is enforced server-side regardless of what's sent.
  branchId: z.union([z.uuid(), z.literal("all")]).optional(),
});
