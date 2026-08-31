import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { ENTITY_STATUS, PARENT_RELATION } from "../../../shared/constants";

export const createParentSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(6).max(20),
  email: z.email().optional(),
  relation: z.enum([PARENT_RELATION.FATHER, PARENT_RELATION.MOTHER, PARENT_RELATION.GUARDIAN]).optional(),
  linkedStudentId: z.uuid(),
});

export const updateParentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(6).max(20).optional(),
  email: z.email().optional(),
  relation: z.enum([PARENT_RELATION.FATHER, PARENT_RELATION.MOTHER, PARENT_RELATION.GUARDIAN]).optional(),
  linkedStudentId: z.uuid().optional(),
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
});

export const listParentsQuerySchema = paginationQuerySchema.extend({
  branchId: z.uuid().optional(),
  linkedStudentId: z.uuid().optional(),
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
  relation: z.enum([PARENT_RELATION.FATHER, PARENT_RELATION.MOTHER, PARENT_RELATION.GUARDIAN]).optional(),
  search: z.string().max(200).optional(),
});

export const bulkDeleteParentsSchema = z.object({
  ids: z.array(z.uuid()).min(1),
});
