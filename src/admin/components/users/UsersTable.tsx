
import { useState, useEffect } from "react";
import { AdminUser, AdminUserRole } from "@/admin/hooks/types/adminUsers.types";
import { useUserActions } from "@/admin/hooks/useUserActions";
import { UserTableContent } from "./UserTableContent";
import { UserDialogs } from "./UserDialogs";

interface UsersTableProps {
  users: AdminUser[];
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
}

export const UsersTable = ({ users, onUpdateStatus, onUpdateRole }: UsersTableProps) => {
  const {
    selectedUser,
    isEditDialogOpen,
    suspendDialogOpen,
    activateDialogOpen,
    activateWithPlanDialogOpen,
    platformPlans,
    isProcessing,
    setIsEditDialogOpen,
    setSuspendDialogOpen,
    setActivateDialogOpen,
    setActivateWithPlanDialogOpen,
    fetchPlatformPlans,
    handleEditUser,
    handleSuspendUser,
    handleActivateUser,
    confirmSuspend,
    confirmActivate,
    confirmActivateWithPlan
  } = useUserActions(onUpdateStatus);

  useEffect(() => {
    // Fetch platform plans when component mounts
    fetchPlatformPlans();
  }, []);

  return (
    <>
      <UserTableContent
        users={users}
        onEditUser={handleEditUser}
        onSuspendUser={handleSuspendUser}
        onActivateUser={handleActivateUser}
      />

      <UserDialogs
        selectedUser={selectedUser}
        isEditDialogOpen={isEditDialogOpen}
        suspendDialogOpen={suspendDialogOpen}
        activateDialogOpen={activateDialogOpen}
        activateWithPlanDialogOpen={activateWithPlanDialogOpen}
        isProcessing={isProcessing}
        platformPlans={platformPlans}
        onCloseEditDialog={() => setIsEditDialogOpen(false)}
        onUpdateStatus={onUpdateStatus}
        onUpdateRole={onUpdateRole}
        onSuspendConfirm={confirmSuspend}
        onActivateConfirm={confirmActivate}
        onActivateWithPlanConfirm={confirmActivateWithPlan}
        onOpenChangeActivate={setActivateDialogOpen}
        onOpenChangeSuspend={setSuspendDialogOpen}
        onOpenChangeActivateWithPlan={setActivateWithPlanDialogOpen}
      />
    </>
  );
};
