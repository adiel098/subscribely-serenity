
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
import { AlertTriangleIcon, Loader2 } from "lucide-react";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const DeletePlanDialog = ({ isOpen, onOpenChange, planId }: Props) => {
  const { data: communities } = useCommunities();
  const community = communities?.[0];
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { deletePlan, refetch } = useSubscriptionPlans(community?.id || "");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePlan.mutateAsync(planId);
      await refetch(); // Explicitly refetch after deletion
      setIsDeleting(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting plan:', error);
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangleIcon className="h-5 w-5" />
            Delete Subscription Plan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700">
            Are you sure you want to delete this subscription plan? This action cannot be undone.
            
            <div className="mt-2 p-3 bg-red-50 rounded-md text-red-700 text-sm">
              <strong>Warning:</strong> If there are subscribers to this plan, it will be deactivated rather than deleted.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Plan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
