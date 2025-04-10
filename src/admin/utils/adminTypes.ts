
export type AdminRole = 'super_admin' | 'moderator' | 'user';

export interface AdminRolePermission {
  role: AdminRole;
  canManageUsers: boolean;
  canManageContent: boolean;
  canAccessAdminPanel: boolean;
  canManageSettings: boolean;
}
