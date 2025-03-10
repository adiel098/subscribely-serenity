
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { AlertTriangle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const DeletePlanDialog = ({ isOpen, onOpenChange, planId }: Props) => {
  const { selectedCommunityId } = useCommunityContext();
  const { deletePlan, plans } = useSubscriptionPlans(selectedCommunityId || "");
  const [isDeleting, setIsDeleting] = useState(false);

  const planToDelete = plans?.find(plan => plan.id === planId);

  const handleDelete = async () => {
    if (!planId) return;
    
    setIsDeleting(true);
    try {
      await deletePlan.mutateAsync(planId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting plan:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-6 border-red-100">
        <DialogHeader className="space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto bg-red-100 p-3 rounded-full w-fit"
          >
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </motion.div>
          <DialogTitle className="text-xl text-center pt-2">Delete Subscription Plan</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete 
            <span className="font-medium text-foreground mx-1">
              {planToDelete?.name || "this plan"}
            </span>? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800 mt-2">
          <p>
            Deleting this plan will remove it from your available options. Any active subscribers
            to this plan will remain until their subscription period ends.
          </p>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            Cancel
          </Button>
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="sm:flex-1 w-full"
          >
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Plan"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
