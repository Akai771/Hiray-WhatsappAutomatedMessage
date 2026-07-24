import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { ENTITY_STATUS } from "../../../shared/constants";

export const createCourseSchema = z.object({
  branchId: z.uuid(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  totalYears: z.coerce.number().int().min(1).max(10),
  semestersPerYear: z.coerce.number().int().min(1).max(4),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  totalYears: z.coerce.number().int().min(1).max(10).optional(),
  semestersPerYear: z.coerce.number().int().min(1).max(4).optional(),
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
});

export const listCoursesQuerySchema = paginationQuerySchema.extend({
  branchId: z.uuid().optional(),
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
});
