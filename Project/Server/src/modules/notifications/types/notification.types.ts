import type { LogStatus, NotificationStatus, RecipientType } from "../../../shared/constants";

export interface Notification {
  id: string;
  templateId: string;
  title: string | null;
  message: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  branchId: string | null;
  courseId: string | null;
  targetYear: number | null;
  targetSemester: number | null;
  audience: RecipientType[];
  createdBy: string;
  scheduledAt: string | null;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  templateId: string;
  // Title is an internal label only, never sent to WhatsApp. Message fills
  // the template's {{1}} placeholder — required only when the chosen
  // template actually has one; enforced in the service, not here, since
  // that depends on which template was picked.
  title?: string;
  message?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  branchId?: string;
  courseId?: string;
  targetYear?: number;
  targetSemester?: number;
  audience: RecipientType[];
  createdBy: string;
  scheduledAt?: string;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  recipientId: string;
  recipientType: RecipientType;
  phone: string;
  status: LogStatus;
  whatsappMessageId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface DeliveryReport {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}
