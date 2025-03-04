
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { AlertTriangleIcon, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  plan: PlatformPlan;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeletePlanDialog = ({ plan, isOpen, onOpenChange }: Props) => {
  const { deletePlan } = usePlatformPlans();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePlan.mutateAsync(plan.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            Delete Platform Plan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "{plan.name}" plan? This action cannot be undone,
            and any community owners currently subscribed to this plan may be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Plan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
