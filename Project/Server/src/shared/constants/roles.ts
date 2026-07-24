export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  FACULTY: "FACULTY",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
