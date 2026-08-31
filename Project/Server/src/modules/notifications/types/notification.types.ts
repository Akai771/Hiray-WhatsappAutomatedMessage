import type { LogStatus, NotificationStatus, RecipientType } from "../../../shared/constants";

export interface Notification {
  id: string;
  templateId: string;
  title: string | null;
  // Admin-typed values for the template's non-auto-filled placeholders, in
  // {{n}} order (the auto-filled recipient-name slot, if any, is excluded —
  // it's computed per-recipient at send time, never stored here).
  variableValues: string[] | null;
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
  // Only populated by list queries that embed the faculty relation
  // (repository's findAll) — null on rows fetched any other way.
  createdByName: string | null;
  scheduledAt: string | null;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  // Only populated by listNotifications (a bulk query alongside the page of
  // notifications) — undefined on rows fetched any other way (getById etc.).
  deliveryReport?: DeliveryReport;
}

export interface CreateNotificationInput {
  templateId: string;
  // Title is an internal label only, never sent to WhatsApp.
  title?: string;
  // Ordered values for the template's placeholders, excluding the
  // auto-filled recipient-name slot (if the template has one) — e.g. a
  // 4-variable template with autoFillRecipientName only needs 3 of these.
  // Required count depends on which template was picked, enforced in the
  // service, not here.
  variableValues?: string[];
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
