import type { AuthUser } from "../shared/types";
import { ROLES } from "../shared/constants";
import { ApiError } from "../shared/errors";

/**
 * Turns a client-requested branchId filter into the branchId a query should
 * actually be scoped to. Faculty never gets to widen scope beyond their own
 * branch, regardless of what the client sends.
 *
 * Returns undefined => no branch filter (Super Admin viewing all branches).
 */
export function resolveBranchScope(user: AuthUser, requestedBranchId?: string | null): string | undefined {
  if (user.role === ROLES.SUPER_ADMIN) {
    return requestedBranchId ?? undefined;
  }

  // FACULTY
  if (!user.branchId) {
    throw ApiError.forbidden("Faculty account is not assigned to a branch");
  }

  if (requestedBranchId && requestedBranchId !== user.branchId) {
    throw ApiError.forbidden("Cannot access data outside your assigned branch");
  }

  return user.branchId;
}
