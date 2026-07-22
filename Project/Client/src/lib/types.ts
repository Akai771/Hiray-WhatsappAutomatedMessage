export type Role = "super_admin" | "faculty";

export type StudentStatus = "Active" | "Graduated" | "Dropped";
export type ParentRelation = "Father" | "Mother" | "Guardian";
export type FacultyRole = "Super Admin" | "Faculty";
export type FacultyStatus = "Active" | "Inactive";
export type NotifType = "Utility" | "Marketing";
export type HistoryStatus = "Sent" | "Scheduled" | "Draft" | "Failed";
export type AttachmentType = "image" | "pdf" | "document" | "video";

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

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  phone: string;
  email: string;
  college: string;
  course: string;
  year: string;
  division: string;
  gender: string;
  status: StudentStatus;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: ParentRelation | "";
  linkedStudent: string;
  college: string;
  status: "Active" | "Inactive";
}

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: FacultyRole;
  department: string;
  status: FacultyStatus;
  lastActive: string;
}

export interface HistoryRow {
  id: string;
  date: string;
  title: string;
  type: NotifType | "—";
  audience: string;
  recipients: number;
  status: HistoryStatus;
  delivered: number;
  read: number;
  failed: number;
}

export interface AttachmentValue {
  name: string;
}

export interface MessageForm {
  notifType: NotifType | "";
  title: string;
  message: string;
  attachments: Record<AttachmentType, AttachmentValue | null>;
  ctaLabel: string;
  ctaUrl: string;
  college: string;
  course: string;
  year: string;
  semester: string;
  division: string;
  audience: { students: boolean; parents: boolean; staff: boolean };
  scheduleMode: "now" | "schedule";
  scheduleDate: string;
  scheduleTime: string;
}

export interface StudentForm {
  rollNo: string;
  name: string;
  phone: string;
  email: string;
  college: string;
  course: string;
  year: string;
  division: string;
  gender: string;
  status: StudentStatus;
}

export interface ParentForm {
  name: string;
  phone: string;
  email: string;
  relation: ParentRelation | "";
  linkedStudent: string;
  college: string;
}

export interface FacultyForm {
  name: string;
  email: string;
  phone: string;
  role: FacultyRole;
  department: string;
}

export type Tab = "messages" | "students" | "parents" | "faculty" | "settings";
export type SettingsTab = "branches" | "courses" | "years" | "divisions";
