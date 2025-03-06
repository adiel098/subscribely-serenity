
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminUser, AdminUserRole } from "@/admin/hooks/types/adminUsers.types";
import { Form } from "@/components/ui/form";
import { useEditUserDialog } from "@/admin/hooks/useEditUserDialog";
import { UserStatusDisplay } from "./edit-user-dialog/UserStatusDisplay";
import { UserFormFields } from "./edit-user-dialog/UserFormFields";
import { DialogFooterActions } from "./edit-user-dialog/DialogFooterActions";
import { ActivateUserWithPlanDialog } from "./dialogs/ActivateUserWithPlanDialog";

interface EditUserDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
}

export const EditUserDialog = ({ 
  user, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onUpdateRole 
}: EditUserDialogProps) => {
  if (!user) return null;

  const {
    form,
    isUpdating,
    activatePlanDialogOpen,
    setActivatePlanDialogOpen,
    platformPlans,
    onSubmit,
    handleActivateWithPlan
  } = useEditUserDialog(user, onUpdateStatus, onUpdateRole, onClose);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {user.full_name} ({user.email})
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <UserStatusDisplay user={user} />
              <UserFormFields form={form} />
              <DialogFooterActions isUpdating={isUpdating} onCancel={onClose} />
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ActivateUserWithPlanDialog
        user={user}
        isOpen={activatePlanDialogOpen}
        onOpenChange={setActivatePlanDialogOpen}
        onConfirm={handleActivateWithPlan}
        plans={platformPlans}
        isLoading={isUpdating}
      />
    </>
  );
};
