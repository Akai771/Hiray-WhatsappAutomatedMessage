export type Role = "super_admin" | "faculty";

export const API_ROLE_LABEL: Record<"SUPER_ADMIN" | "FACULTY", string> = {
  SUPER_ADMIN: "Super Admin",
  FACULTY: "Faculty",
};

export type StudentStatus = "ACTIVE" | "GRADUATED" | "DROPPED";
export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  GRADUATED: "Graduated",
  DROPPED: "Dropped",
};
export type ParentRelation = "FATHER" | "MOTHER" | "GUARDIAN";
export const PARENT_RELATION_LABEL: Record<ParentRelation, string> = {
  FATHER: "Father",
  MOTHER: "Mother",
  GUARDIAN: "Guardian",
};
export type EntityStatus = "ACTIVE" | "INACTIVE";
export const ENTITY_STATUS_LABEL: Record<EntityStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
export type NotifType = "UTILITY" | "MARKETING";
export const NOTIF_TYPE_LABEL: Record<NotifType, string> = {
  UTILITY: "Utility",
  MARKETING: "Marketing",
};
export type NotificationStatus = "DRAFT" | "SCHEDULED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED";
export const NOTIFICATION_STATUS_LABEL: Record<NotificationStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  QUEUED: "Queued",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface Course {
  id: string;
  branchId: string;
  name: string;
  code: string;
  totalYears: number;
  semestersPerYear: number;
}

export interface HistoryRow {
  id: string;
  date: string;
  title: string;
  type: NotifType | "—";
  sentBy: string;
  audience: string;
  /** Branch · Course · Year · Semester this send was scoped to, e.g. "Hiray College · Computer Engg · Year 2 · Sem 3". "All Branches" when unscoped. */
  scopeLabel: string;
  recipients: number;
  status: NotificationStatus;
  delivered: number;
  read: number;
  failed: number;
}

export interface AttachmentValue {
  name: string;
  url: string;
  mimeType: string;
}

export interface MessageForm {
  notifType: NotifType | "";
  templateId: string;
  title: string;
  /**
   * Values for the selected template's non-auto-filled placeholders, in
   * {{n}} order (excluding the auto-filled recipient-name slot, if any).
   * Length is kept in sync with the template's variable count whenever the
   * template selection changes.
   */
  variableValues: string[];
  attachment: AttachmentValue | null;
  ctaLabel: string;
  ctaUrl: string;
  branchId: string;
  courseId: string;
  year: string;
  semester: string;
  audience: { students: boolean; parents: boolean };
  scheduleMode: "now" | "schedule";
  scheduleDate: string;
  scheduleTime: string;
}

export interface StudentForm {
  rollNo: string;
  name: string;
  phone: string;
  email: string;
  branchId: string;
  courseId: string;
  year: string;
  semester: string;
  division: string;
  gender: string;
  status: StudentStatus;
}

export interface PromoteForm {
  branchId: string;
  courseId: string;
  year: string;
  semester: string;
}

export interface ParentForm {
  name: string;
  phone: string;
  email: string;
  relation: ParentRelation | "";
  linkedStudentId: string;
  status: EntityStatus;
}

export interface FacultyForm {
  name: string;
  email: string;
  password: string;
  branchId: string;
  courseId: string;
  role: "SUPER_ADMIN" | "FACULTY";
}

export type Tab = "messages" | "students" | "parents" | "faculty" | "analytics" | "settings";
export type SettingsTab = "branches" | "courses" | "years" | "templates" | "pricing";
