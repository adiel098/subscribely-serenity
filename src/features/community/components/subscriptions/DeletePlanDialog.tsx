import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";

interface DeletePlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const DeletePlanDialog = ({
  isOpen,
  onOpenChange,
  planId
}: DeletePlanDialogProps) => {
  const { deletePlan } = useSubscriptionPlans("");

  const handleDelete = async () => {
    try {
      await deletePlan.mutateAsync(planId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the plan
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-primary-foreground hover:bg-red-500/90 h-10 px-4 py-2"
            onClick={handleDelete}
          >
            Delete
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
