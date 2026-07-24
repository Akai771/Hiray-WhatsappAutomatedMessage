import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { RECIPIENT_TYPE, NOTIFICATION_STATUS } from "../../../shared/constants";

export const createNotificationSchema = z.object({
  templateId: z.uuid(),
  title: z.string().min(1).max(300),
  message: z.string().min(1),
  attachmentUrl: z.url().optional(),
  attachmentType: z.string().optional(),
  buttonLabel: z.string().max(50).optional(),
  buttonUrl: z.url().optional(),
  branchId: z.uuid().optional(),
  courseId: z.uuid().optional(),
  targetYear: z.coerce.number().int().positive().optional(),
  targetSemester: z.coerce.number().int().positive().optional(),
  audience: z.array(z.enum([RECIPIENT_TYPE.STUDENT, RECIPIENT_TYPE.PARENT])).min(1),
  scheduledAt: z.iso.datetime().optional(),
});

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  branchId: z.uuid().optional(),
  status: z
    .enum([
      NOTIFICATION_STATUS.DRAFT,
      NOTIFICATION_STATUS.SCHEDULED,
      NOTIFICATION_STATUS.QUEUED,
      NOTIFICATION_STATUS.PROCESSING,
      NOTIFICATION_STATUS.COMPLETED,
      NOTIFICATION_STATUS.CANCELLED,
      NOTIFICATION_STATUS.FAILED,
    ])
    .optional(),
});
