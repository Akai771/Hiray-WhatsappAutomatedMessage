import type { Role } from "../constants/roles";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
}
