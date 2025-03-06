
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserCheck } from "lucide-react";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface UnsuspendUserDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const UnsuspendUserDialog = ({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
}: UnsuspendUserDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsuspend User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unsuspend {user?.full_name || user?.email}? 
            This will restore their access to the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            <UserCheck className="mr-2 h-4 w-4" />
            Unsuspend User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
