
import { useAdminUsersFetch } from "./useAdminUsersFetch";
import { useAdminUserStatus } from "./useAdminUserStatus";
import { useAdminUserRole } from "./useAdminUserRole";
import { AdminUser, AdminUserRole } from "./types/adminUsers.types";

export type { AdminUser, AdminUserRole };

export const useAdminUsers = () => {
  const { users, isLoading, error, fetchUsers } = useAdminUsersFetch();
  const { updateUserStatus, isUpdating: isUpdatingStatus } = useAdminUserStatus(fetchUsers);
  const { updateUserRole, isUpdating: isUpdatingRole } = useAdminUserRole(fetchUsers);

  const isUpdating = isUpdatingStatus || isUpdatingRole;

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserStatus,
    updateUserRole,
    isUpdating
  };
};
