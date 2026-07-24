import {
  signInWithPassword,
  signOut,
  refreshSession,
  getAuthProfile,
  setUserPassword,
} from "../../../integrations/auth";
import type { AuthUser } from "../../../shared/types";

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number | undefined;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const { session, user } = await signInWithPassword(email, password);
  const profile = await getAuthProfile(user.id);

  return {
    user: profile,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
  };
}

export async function logout(accessToken: string): Promise<void> {
  await signOut(accessToken);
}

export async function refresh(refreshToken: string): Promise<AuthSession> {
  const { session, user } = await refreshSession(refreshToken);
  const profile = await getAuthProfile(user.id);

  return {
    user: profile,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
  };
}

export async function resetFacultyPassword(facultyId: string, newPassword: string): Promise<void> {
  await setUserPassword(facultyId, newPassword);
}
