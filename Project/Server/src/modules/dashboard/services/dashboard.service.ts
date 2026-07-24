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

  return {
    totalBranches,
    totalCourses,
    totalFaculty,
    // Student/Parent modules are placeholders (server.md § Excluded Modules) — no data source yet.
    totalStudents: 0,
    totalParents: 0,
    totalNotifications,
    deliveredMessages,
    failedMessages,
    pendingMessages,
  };
}
