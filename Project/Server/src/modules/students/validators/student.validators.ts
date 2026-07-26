import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { STUDENT_STATUS } from "../../../shared/constants";

export const createStudentSchema = z.object({
  rollNo: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  phone: z.string().min(6).max(20),
  email: z.email().optional(),
  branchId: z.uuid(),
  courseId: z.uuid(),
  year: z.coerce.number().int().positive(),
  semester: z.coerce.number().int().positive(),
  division: z.string().max(10).optional(),
  gender: z.string().max(20).optional(),
});

export const updateStudentSchema = z.object({
  rollNo: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(6).max(20).optional(),
  email: z.email().optional(),
  courseId: z.uuid().optional(),
  year: z.coerce.number().int().positive().optional(),
  semester: z.coerce.number().int().positive().optional(),
  division: z.string().max(10).optional(),
  gender: z.string().max(20).optional(),
  status: z.enum([STUDENT_STATUS.ACTIVE, STUDENT_STATUS.GRADUATED, STUDENT_STATUS.DROPPED]).optional(),
});

export const listStudentsQuerySchema = paginationQuerySchema.extend({
  branchId: z.uuid().optional(),
  courseId: z.uuid().optional(),
  year: z.coerce.number().int().positive().optional(),
  semester: z.coerce.number().int().positive().optional(),
  status: z.enum([STUDENT_STATUS.ACTIVE, STUDENT_STATUS.GRADUATED, STUDENT_STATUS.DROPPED]).optional(),
  search: z.string().max(200).optional(),
});

export const bulkDeleteStudentsSchema = z.object({
  ids: z.array(z.uuid()).min(1),
});
