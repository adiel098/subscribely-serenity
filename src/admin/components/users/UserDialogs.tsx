
import { AdminUser, AdminUserRole } from "@/admin/hooks/types/adminUsers.types";
import { EditUserDialog } from "./EditUserDialog";
import { SuspendUserDialog } from "./dialogs/SuspendUserDialog";
import { ActivateUserDialog } from "./dialogs/ActivateUserDialog";
import { ActivateUserWithPlanDialog } from "./dialogs/ActivateUserWithPlanDialog";

interface UserDialogsProps {
  selectedUser: AdminUser | null;
  isEditDialogOpen: boolean;
  suspendDialogOpen: boolean;
  activateDialogOpen: boolean;
  activateWithPlanDialogOpen: boolean;
  isProcessing: boolean;
  platformPlans: { id: string; name: string }[];
  onCloseEditDialog: () => void;
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
  onSuspendConfirm: () => void;
  onActivateConfirm: () => void;
  onActivateWithPlanConfirm: (planId: string, duration: string) => void;
  onOpenChangeActivate: (open: boolean) => void;
  onOpenChangeSuspend: (open: boolean) => void;
  onOpenChangeActivateWithPlan: (open: boolean) => void;
}

export const UserDialogs = ({
  selectedUser,
  isEditDialogOpen,
  suspendDialogOpen,
  activateDialogOpen,
  activateWithPlanDialogOpen,
  isProcessing,
  platformPlans,
  onCloseEditDialog,
  onUpdateStatus,
  onUpdateRole,
  onSuspendConfirm,
  onActivateConfirm,
  onActivateWithPlanConfirm,
  onOpenChangeActivate,
  onOpenChangeSuspend,
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
