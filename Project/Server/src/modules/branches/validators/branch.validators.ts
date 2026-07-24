import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { ENTITY_STATUS } from "../../../shared/constants";

export const createBranchSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  address: z.string().max(500).optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  address: z.string().max(500).optional(),
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
});

export const listBranchesQuerySchema = paginationQuerySchema.extend({
  status: z.enum([ENTITY_STATUS.ACTIVE, ENTITY_STATUS.INACTIVE]).optional(),
});
