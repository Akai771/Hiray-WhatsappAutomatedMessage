import { apiGet, apiPost } from "./apiClient";
import { clearSession, getStoredUser, setSession } from "./tokenStorage";
import type { AuthSession, AuthUser } from "./types";

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await apiPost<AuthSession>("/auth/login", { email, password });
  setSession(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiPost<null>("/auth/logout");
  } finally {
    clearSession();
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiGet<AuthUser>("/auth/me");
  return data;
}

export async function resetFacultyPassword(facultyId: string, newPassword: string): Promise<void> {
  await apiPost<null>(`/auth/faculty/${facultyId}/reset-password`, { newPassword });
}

export function getCachedUser(): AuthUser | null {
  return getStoredUser();
}
