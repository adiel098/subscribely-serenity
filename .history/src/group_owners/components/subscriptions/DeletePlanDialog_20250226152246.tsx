import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangleIcon } from "lucide-react";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunities } from "@/hooks/useCommunities";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const DeletePlanDialog = ({ isOpen, onOpenChange, planId }: Props) => {
  const { data: communities } = useCommunities();
  const community = communities?.[0];
  
  const { deletePlan } = useSubscriptionPlans(community?.id || "");

  const handleDelete = async () => {
    try {
      await deletePlan.mutateAsync(planId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            Delete Subscription Plan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this subscription plan? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
