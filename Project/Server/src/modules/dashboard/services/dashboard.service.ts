import { supabaseAdmin } from "../../../config/supabase";
import { resolveBranchScope } from "../../../middleware/branchScope";
import { ROLES } from "../../../shared/constants";
import { ApiError } from "../../../shared/errors";
import type { AuthUser } from "../../../shared/types";

async function countRows(table: string, filters: (q: any) => any): Promise<number> {
  const query = filters(supabaseAdmin.from(table).select("id", { head: true, count: "exact" }));
  const { count, error } = await query;
  if (error) throw ApiError.internal(`Failed to count ${table}`, error.message);
  return count ?? 0;
}

async function countLogsByStatuses(branchId: string | undefined, statuses: string[]): Promise<number> {
  let query = supabaseAdmin
    .from("notification_logs")
    .select("id, notifications!inner(branch_id)", { head: true, count: "exact" })
    .in("status", statuses);
  if (branchId) query = query.eq("notifications.branch_id", branchId);

  const { count, error } = await query;
  if (error) throw ApiError.internal("Failed to count notification logs", error.message);
  return count ?? 0;
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

export async function getDashboardStats(user: AuthUser): Promise<DashboardStats> {
  const branchId = resolveBranchScope(user, undefined);

  const [totalBranches, totalCourses, totalFaculty, totalNotifications, deliveredMessages, failedMessages, pendingMessages] =
    await Promise.all([
      user.role === ROLES.SUPER_ADMIN
        ? countRows("branches", (q) => q)
        : Promise.resolve(1),
      countRows("courses", (q) => (branchId ? q.eq("branch_id", branchId) : q)),
      countRows("faculty", (q) => {
        let scoped = q.eq("role", ROLES.FACULTY);
        return branchId ? scoped.eq("branch_id", branchId) : scoped;
      }),
      countRows("notifications", (q) => (branchId ? q.eq("branch_id", branchId) : q)),
      countLogsByStatuses(branchId, ["DELIVERED", "READ"]),
      countLogsByStatuses(branchId, ["FAILED"]),
      countLogsByStatuses(branchId, ["PENDING", "SENT"]),
    ]);

  const [totalStudents, totalParents] = await Promise.all([
    countRows("students", (q) => (branchId ? q.eq("branch_id", branchId) : q)),
    countParents(branchId),
  ]);

  return {
    totalBranches,
    totalCourses,
    totalFaculty,
    totalStudents,
    totalParents,
    totalNotifications,
    deliveredMessages,
    failedMessages,
    pendingMessages,
  };
}

// Parents have no branch of their own — scoped through the linked student,
// same inner-join approach as recipient.repository.ts's resolveParents.
async function countParents(branchId: string | undefined): Promise<number> {
  let query = supabaseAdmin
    .from("parents")
    .select("id, students!parents_linked_student_id_fkey!inner(branch_id)", { head: true, count: "exact" });
  if (branchId) query = query.eq("students.branch_id", branchId);

  const { count, error } = await query;
  if (error) throw ApiError.internal("Failed to count parents", error.message);
  return count ?? 0;
}

export interface SenderStat {
  senderId: string;
  name: string;
  // The sender's own assigned course, if any — separate from the
  // notification's audience-targeting course (a faculty member's course
  // scope vs. who they chose to message).
  courseName: string | null;
  count: number;
}

export interface TemplateStat {
  templateId: string;
  name: string;
  whatsappTemplateName: string;
  count: number;
}

export interface ScopeStat {
  id: string;
  name: string;
  count: number;
}

export interface AnalyticsData {
  totalNotifications: number;
  totalRecipients: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
  sent: number;
  // Top 10 by send count, most first.
  topSenders: SenderStat[];
  topTemplates: TemplateStat[];
  categoryCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  // Notifications sent by a SUPER_ADMIN vs by FACULTY accounts.
  roleCounts: Record<string, number>;
  // Branches/courses ranked by successful (delivered or read) recipient
  // sends — excludes global, unscoped sends since there's no branch/course
  // to attribute them to.
  topBranches: ScopeStat[];
  topCourses: ScopeStat[];
  // Courses ranked by how much their faculty use the app — attributed to
  // the SENDER's own course (faculty.course_id), not the audience the
  // notification was sent to. Answers "which course's faculty are actually
  // sending notifications, and how often" — distinct from topCourses above.
  topSenderCourses: ScopeStat[];
}

// Notification volume here is small enough (a college's own bulk-messaging
// tool, not a mass sender) that fetching the scoped rows and aggregating in
// JS is simpler and more maintainable than a raw SQL/RPC GROUP BY — same
// tradeoff getDeliveryReport already makes for per-notification counts.
export async function getAnalytics(user: AuthUser): Promise<AnalyticsData> {
  const branchId = resolveBranchScope(user, undefined);

  let query = supabaseAdmin
    .from("notifications")
    .select(
      "id, template_id, created_by, status, faculty:created_by(name, role, course_id, courses(name)), notification_templates(name, whatsapp_template_name, category)",
    );
  if (branchId) query = query.eq("branch_id", branchId);

  const { data, error } = await query;
  if (error) throw ApiError.internal("Failed to compute analytics", error.message);

  const rows = (data ?? []) as any[];

  const senderCounts = new Map<string, SenderStat>();
  const templateCounts = new Map<string, TemplateStat>();
  const categoryCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const roleCounts: Record<string, number> = {};
  const senderCourseCounts = new Map<string, ScopeStat>();

  for (const row of rows) {
    const senderId = row.created_by as string;
    const senderCourseId: string | undefined = row.faculty?.course_id;
    const senderCourseName: string | null = row.faculty?.courses?.name ?? null;
    const sender = senderCounts.get(senderId) ?? { senderId, name: row.faculty?.name ?? "Unknown", courseName: senderCourseName, count: 0 };
    sender.count++;
    senderCounts.set(senderId, sender);

    if (senderCourseId) {
      const stat = senderCourseCounts.get(senderCourseId) ?? { id: senderCourseId, name: senderCourseName ?? "Unknown Course", count: 0 };
      stat.count++;
      senderCourseCounts.set(senderCourseId, stat);
    }

    const senderRole = row.faculty?.role ?? "FACULTY";
    roleCounts[senderRole] = (roleCounts[senderRole] ?? 0) + 1;

    const templateId = row.template_id as string;
    const template = templateCounts.get(templateId) ?? {
      templateId,
      name: row.notification_templates?.name ?? "Deleted template",
      whatsappTemplateName: row.notification_templates?.whatsapp_template_name ?? "—",
      count: 0,
    };
    template.count++;
    templateCounts.set(templateId, template);

    const category = row.notification_templates?.category;
    if (category) categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;

    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const { topBranches, topCourses } = await getTopScopes(branchId);

  // `status` on a log holds only its latest webhook event — WhatsApp fires
  // delivered then read in quick succession, overwriting DELIVERED. Same fix
  // as notificationLog.repository.ts's getDeliveryReport: a READ log was
  // necessarily delivered first, so it counts under both, or "Delivered"
  // would misleadingly exclude every message that's since been opened.
  const [deliveredOnly, read, failed, pending, sent] = await Promise.all([
    countLogsByStatuses(branchId, ["DELIVERED"]),
    countLogsByStatuses(branchId, ["READ"]),
    countLogsByStatuses(branchId, ["FAILED"]),
    countLogsByStatuses(branchId, ["PENDING"]),
    countLogsByStatuses(branchId, ["SENT"]),
  ]);

  return {
    totalNotifications: rows.length,
    totalRecipients: deliveredOnly + read + failed + pending + sent,
    delivered: deliveredOnly + read,
    read,
    failed,
    pending,
    sent,
    topSenders: [...senderCounts.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    topTemplates: [...templateCounts.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    categoryCounts,
    statusCounts,
    roleCounts,
    topBranches,
    topCourses,
    topSenderCourses: [...senderCourseCounts.values()].sort((a, b) => b.count - a.count).slice(0, 10),
  };
}

// Ranks branches/courses by successful (delivered or read) recipient sends.
// A separate query from the notification-level aggregation above because
// "successful" is a per-recipient outcome (notification_logs), not a
// per-notification one — a single broadcast can partly succeed and partly
// fail across its recipients.
async function getTopScopes(branchId: string | undefined): Promise<{ topBranches: ScopeStat[]; topCourses: ScopeStat[] }> {
  let query = supabaseAdmin
    .from("notification_logs")
    .select("notifications!inner(branch_id, course_id, branches(name), courses(name))")
    .in("status", ["DELIVERED", "READ"]);
  if (branchId) query = query.eq("notifications.branch_id", branchId);

  const { data, error } = await query;
  if (error) throw ApiError.internal("Failed to compute scope analytics", error.message);

  const branchCounts = new Map<string, ScopeStat>();
  const courseCounts = new Map<string, ScopeStat>();

  for (const row of (data ?? []) as any[]) {
    const n = row.notifications;
    if (n?.branch_id) {
      const stat = branchCounts.get(n.branch_id) ?? { id: n.branch_id, name: n.branches?.name ?? "Unknown Branch", count: 0 };
      stat.count++;
      branchCounts.set(n.branch_id, stat);
    }
    if (n?.course_id) {
      const stat = courseCounts.get(n.course_id) ?? { id: n.course_id, name: n.courses?.name ?? "Unknown Course", count: 0 };
      stat.count++;
      courseCounts.set(n.course_id, stat);
    }
  }

  return {
    topBranches: [...branchCounts.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    topCourses: [...courseCounts.values()].sort((a, b) => b.count - a.count).slice(0, 10),
  };
}
