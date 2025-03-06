
import { AdminUser, AdminUserRole } from "@/admin/hooks/types/adminUsers.types";
import { EditUserDialog } from "./EditUserDialog";
import { SuspendUserDialog } from "./dialogs/SuspendUserDialog";
import { ActivateUserDialog } from "./dialogs/ActivateUserDialog";
import { ActivateUserWithPlanDialog } from "./dialogs/ActivateUserWithPlanDialog";
import { UnsuspendUserDialog } from "./dialogs/UnsuspendUserDialog";

interface UserDialogsProps {
  selectedUser: AdminUser | null;
  isEditDialogOpen: boolean;
  suspendDialogOpen: boolean;
  activateDialogOpen: boolean;
  activateWithPlanDialogOpen: boolean;
  unsuspendDialogOpen: boolean;
  isProcessing: boolean;
  platformPlans: { id: string; name: string }[];
  onCloseEditDialog: () => void;
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
  onSuspendConfirm: () => void;
  onActivateConfirm: () => void;
  onUnsuspendConfirm: () => void;
  onActivateWithPlanConfirm: (planId: string, duration: string) => void;
  onOpenChangeActivate: (open: boolean) => void;
  onOpenChangeSuspend: (open: boolean) => void;
  onOpenChangeUnsuspend: (open: boolean) => void;
  onOpenChangeActivateWithPlan: (open: boolean) => void;
}

export const UserDialogs = ({
  selectedUser,
  isEditDialogOpen,
  suspendDialogOpen,
  activateDialogOpen,
  activateWithPlanDialogOpen,
  unsuspendDialogOpen,
  isProcessing,
  platformPlans,
  onCloseEditDialog,
  onUpdateStatus,
  onUpdateRole,
  onSuspendConfirm,
  onActivateConfirm,
  onUnsuspendConfirm,
  onActivateWithPlanConfirm,
  onOpenChangeActivate,
  onOpenChangeSuspend,
  onOpenChangeUnsuspend,
  onOpenChangeActivateWithPlan
}: UserDialogsProps) => {
  return (
    <>
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isEditDialogOpen}
          onClose={onCloseEditDialog}
          onUpdateStatus={onUpdateStatus}
          onUpdateRole={onUpdateRole}
        />
      )}

      <SuspendUserDialog 
        user={selectedUser}
        isOpen={suspendDialogOpen}
        onOpenChange={onOpenChangeSuspend}
        onConfirm={onSuspendConfirm}
      />

      <UnsuspendUserDialog 
        user={selectedUser}
        isOpen={unsuspendDialogOpen}
        onOpenChange={onOpenChangeUnsuspend}
        onConfirm={onUnsuspendConfirm}
      />

      <ActivateUserDialog
        user={selectedUser}
        isOpen={activateDialogOpen}
        onOpenChange={onOpenChangeActivate}
        onConfirm={onActivateConfirm}
      />

      <ActivateUserWithPlanDialog
        user={selectedUser}
        isOpen={activateWithPlanDialogOpen}
        onOpenChange={onOpenChangeActivateWithPlan}
        onConfirm={onActivateWithPlanConfirm}
        plans={platformPlans}
        isLoading={isProcessing}
      />
    </>
  );
};
