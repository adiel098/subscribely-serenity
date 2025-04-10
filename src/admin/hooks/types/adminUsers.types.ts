
import { AdminRole } from "./admin.types";

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
  email: string; 
  name?: string;
  status?: string;
}

export interface UpdateUserStatusParams {
  userId: string;
  isActive: boolean;
}

export interface UpdateUserRoleParams {
  userId: string;
  role: AdminRole;
}

export interface GrantAdminAccessParams {
  userId: string;
  role: AdminRole;
}
