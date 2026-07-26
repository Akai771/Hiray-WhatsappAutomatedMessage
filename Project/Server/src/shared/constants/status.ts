export const ENTITY_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

export const NOTIFICATION_STATUS = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS];

export const LOG_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
} as const;
export type LogStatus = (typeof LOG_STATUS)[keyof typeof LOG_STATUS];

export const RECIPIENT_TYPE = {
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;
export type RecipientType = (typeof RECIPIENT_TYPE)[keyof typeof RECIPIENT_TYPE];

export const TEMPLATE_CATEGORY = {
  UTILITY: "UTILITY",
  MARKETING: "MARKETING",
} as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORY)[keyof typeof TEMPLATE_CATEGORY];

export const STUDENT_STATUS = {
  ACTIVE: "ACTIVE",
  GRADUATED: "GRADUATED",
  DROPPED: "DROPPED",
} as const;
export type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

export const PARENT_RELATION = {
  FATHER: "FATHER",
  MOTHER: "MOTHER",
  GUARDIAN: "GUARDIAN",
} as const;
export type ParentRelation = (typeof PARENT_RELATION)[keyof typeof PARENT_RELATION];
