import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/community/useSubscriptionPlans";
import { useCommunityContext } from '@/features/community/providers/CommunityContext';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const DeletePlanDialog = ({ isOpen, onOpenChange, planId }: Props) => {
  const { selectedCommunityId } = useCommunityContext();
  const { deletePlan } = useSubscriptionPlans(selectedCommunityId || "");

  const handleDeletePlan = async () => {
    try {
      await deletePlan.mutateAsync(planId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 inline-block align-middle" />
            Delete Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subscription plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeletePlan}
            disabled={deletePlan.isPending}
          >
            {deletePlan.isPending ? (
              <>
                Deleting <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
