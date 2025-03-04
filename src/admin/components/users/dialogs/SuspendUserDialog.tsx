
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
import { Ban } from "lucide-react";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface SuspendUserDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const SuspendUserDialog = ({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
}: SuspendUserDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to suspend {user?.full_name || user?.email}? 
            This will prevent them from logging in or accessing any features of the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            <Ban className="mr-2 h-4 w-4" />
            Suspend User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
