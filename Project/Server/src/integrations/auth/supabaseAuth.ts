import { supabaseAnon, supabaseAdmin } from "../../config/supabase";
import { ApiError } from "../../shared/errors";

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  return data;
}

export async function signOut(accessToken: string) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) throw ApiError.internal("Failed to sign out", error.message);
}

export async function refreshSession(refreshToken: string) {
  const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
  return { session: data.session, user: data.user };
}

export async function getSupabaseUser(accessToken: string) {
  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  if (error || !data.user) {
    throw ApiError.unauthorized("Invalid or expired session");
  }
  return data.user;
}

export async function setUserPassword(userId: string, newPassword: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw ApiError.internal("Failed to reset password", error.message);
}

export async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw ApiError.badRequest(error?.message ?? "Failed to create auth user");
  }
  return data.user;
}

export async function deleteAuthUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw ApiError.internal("Failed to delete auth user", error.message);
}
