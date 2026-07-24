import { supabaseAdmin } from "../../config/supabase";
import type { AuthUser } from "../../shared/types";
import { ENTITY_STATUS } from "../../shared/constants";
import { ApiError } from "../../shared/errors";

interface FacultyRow {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "FACULTY";
  branch_id: string | null;
  status: string;
}

// The "faculty" table backs both auth roles (SUPER_ADMIN and FACULTY) per
// server.md — a Supabase Auth user id maps 1:1 to a row here.
export async function getAuthProfile(userId: string): Promise<AuthUser> {
  const { data, error } = await supabaseAdmin
    .from("faculty")
    .select("id, email, role, branch_id, status")
    .eq("id", userId)
    .single<FacultyRow>();

  if (error || !data) {
    throw ApiError.unauthorized("No profile found for this account");
  }

  if (data.status !== ENTITY_STATUS.ACTIVE) {
    throw ApiError.forbidden("This account has been deactivated");
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    branchId: data.branch_id,
  };
}
