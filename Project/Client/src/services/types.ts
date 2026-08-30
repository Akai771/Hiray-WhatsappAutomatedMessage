// Types mirroring the backend's actual API shapes (Server/server.md,
// Server/src/shared, Server/src/modules/**/types). Kept separate from
// src/lib/types.ts, which models the mock UI's display shapes.

export type ApiRole = "SUPER_ADMIN" | "FACULTY";
export type EntityStatus = "ACTIVE" | "INACTIVE";
export type TemplateCategory = "UTILITY" | "MARKETING";
export type RecipientType = "STUDENT" | "PARENT";
export type StudentStatus = "ACTIVE" | "GRADUATED" | "DROPPED";
export type ParentRelation = "FATHER" | "MOTHER" | "GUARDIAN";
export type NotificationStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";
export type LogStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
  branchId: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number | undefined;
}

export interface ApiBranch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  year: number;
  semester: number;
}

export interface ApiCourse {
  id: string;
  branchId: string;
  name: string;
  code: string;
  totalYears: number;
  semestersPerYear: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  semesters: Semester[];
}

export interface ApiFaculty {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
  branchId: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotificationTemplate {
  id: string;
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  variables: string[];
  bodyText: string;
  autoFillRecipientName: boolean;
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
  buttonUrlIsDynamic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotification {
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

export interface ApiNotificationLog {
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

export interface DashboardStats {
  totalBranches: number;
  totalCourses: number;
  totalFaculty: number;
  totalStudents: number;
  totalParents: number;
  totalNotifications: number;
  deliveredMessages: number;
  failedMessages: number;
  pendingMessages: number;
}

export interface ApiStudent {
  id: string;
  rollNo: string;
  name: string;
  phone: string;
  email: string | null;
  branchId: string;
  courseId: string;
  year: number;
  semester: number;
  division: string | null;
  gender: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiParent {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  relation: ParentRelation | null;
  linkedStudentId: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  url: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
}
