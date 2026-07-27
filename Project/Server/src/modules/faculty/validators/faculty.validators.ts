import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { ENTITY_STATUS, ROLES } from "../../../shared/constants";

export const createFacultySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  password: z.string().min(8),
  branchId: z.uuid(),
});

export const updateFacultySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  branchId: z.uuid().optional(),
  role: z.enum([ROLES.SUPER_ADMIN, ROLES.FACULTY]).optional(),
});

export const resetFacultyPasswordSchema = z.object({
  password: z.string().min(8),
});

export const updateFacultyStatusSchema = z.object({
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]),
});

export const listFacultyQuerySchema = paginationQuerySchema.extend({
  branchId: z.uuid().optional(),
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
});
