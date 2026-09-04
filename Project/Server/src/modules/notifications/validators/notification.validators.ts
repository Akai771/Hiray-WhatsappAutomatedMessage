import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { RECIPIENT_TYPE, NOTIFICATION_STATUS } from "../../../shared/constants";

export const createNotificationSchema = z.object({
  templateId: z.uuid(),
  // Both optional at the schema level — how many values are actually
  // required depends on the chosen template's variable count, checked in
  // notification.service.ts once the template's loaded.
  title: z.string().max(300).optional(),
  variableValues: z.array(z.string().max(1024)).max(20).optional(),
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

export const recipientCountQuerySchema = z.object({
  branchId: z.uuid().optional(),
  courseId: z.uuid().optional(),
  year: z.coerce.number().int().positive().optional(),
  semester: z.coerce.number().int().positive().optional(),
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
