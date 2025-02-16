
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            Delete Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subscription plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deletePlan.isPending}
          >
            {deletePlan.isPending ? 'Deleting...' : 'Delete Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
