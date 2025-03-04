
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
import { motion } from "framer-motion";

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
      <AlertDialogContent className="max-w-md border-0 shadow-lg rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-xl font-semibold">
            <div className="bg-red-100 p-1.5 rounded-full">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            Delete Subscription Plan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 space-y-3 mt-2">
            <p>Are you sure you want to delete this subscription plan? This action cannot be undone.</p>
            
            <div className="mt-3 p-3 bg-red-50 rounded-md text-red-700 text-sm border border-red-100">
              <strong className="font-medium">⚠️ Warning:</strong> If there are subscribers to this plan, it will be deactivated rather than deleted.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center gap-3 mt-4">
          <motion.div whileTap={{ scale: 0.97 }}>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-100 hover:text-gray-800 font-medium transition-all duration-200">
              Cancel
            </AlertDialogCancel>
          </motion.div>
          
          <motion.div 
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: isDeleting ? 1 : 1.02 }}
          >
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Plan"}
            </AlertDialogAction>
          </motion.div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
