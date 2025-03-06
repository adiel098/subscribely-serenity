
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
    unsuspendDialogOpen,
    activateDialogOpen,
    activateWithPlanDialogOpen,
    platformPlans,
    isProcessing,
    setIsEditDialogOpen,
    setSuspendDialogOpen,
    setUnsuspendDialogOpen,
    setActivateDialogOpen,
    setActivateWithPlanDialogOpen,
    fetchPlatformPlans,
    handleEditUser,
    handleSuspendUser,
    handleUnsuspendUser,
    handleActivateUser,
    confirmSuspend,
    confirmUnsuspend,
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
        onUnsuspendUser={handleUnsuspendUser}
        onActivateUser={handleActivateUser}
      />

      <UserDialogs
        selectedUser={selectedUser}
        isEditDialogOpen={isEditDialogOpen}
        suspendDialogOpen={suspendDialogOpen}
        unsuspendDialogOpen={unsuspendDialogOpen}
        activateDialogOpen={activateDialogOpen}
        activateWithPlanDialogOpen={activateWithPlanDialogOpen}
        isProcessing={isProcessing}
        platformPlans={platformPlans}
        onCloseEditDialog={() => setIsEditDialogOpen(false)}
        onUpdateStatus={onUpdateStatus}
        onUpdateRole={onUpdateRole}
        onSuspendConfirm={confirmSuspend}
        onUnsuspendConfirm={confirmUnsuspend}
        onActivateConfirm={confirmActivate}
        onActivateWithPlanConfirm={confirmActivateWithPlan}
        onOpenChangeActivate={setActivateDialogOpen}
        onOpenChangeSuspend={setSuspendDialogOpen}
        onOpenChangeUnsuspend={setUnsuspendDialogOpen}
        onOpenChangeActivateWithPlan={setActivateWithPlanDialogOpen}
      />
    </>
  );
};
