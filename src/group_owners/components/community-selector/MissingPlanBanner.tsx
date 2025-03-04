
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface MissingPlanBannerProps {
  hasPlan: boolean;
  selectedCommunityId: string | null;
  navigateToPlans: () => void;
}

export const MissingPlanBanner = ({ 
  hasPlan, 
  selectedCommunityId,
  navigateToPlans 
}: MissingPlanBannerProps) => {
  if (!selectedCommunityId || hasPlan) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 bg-amber-100 rounded-full p-1">
          <Package className="h-4 w-4 text-amber-600" />
        </div>
        <p className="text-amber-800 text-sm">No active subscription plans 🔔</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={navigateToPlans} 
            variant="ghost" 
            size="sm" 
            className="ml-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white gap-1 h-7 px-3 shadow-sm"
          >
            Add Plan 
            <ArrowRight className="h-3 w-3" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
