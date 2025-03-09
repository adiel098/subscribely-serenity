
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PlatformSubscriptionDialog } from "../platform-subscription/PlatformSubscriptionDialog";
import { useState } from "react";
import { usePlatformSubscription } from "@/group_owners/hooks/usePlatformSubscription";

export const PlatformSubscriptionBanner = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { hasPlatformPlan, isLoading } = usePlatformSubscription();

  // Don't render anything during initial loading to prevent flickering
  if (isLoading) return null;
  
  // If user has a plan, don't show the banner
  if (hasPlatformPlan) return null;

  return (
    <AnimatePresence>
      {!hasPlatformPlan && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 bg-amber-100 rounded-full p-1">
              <Package className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-amber-800 text-sm">No active platform subscription 🔔</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setShowDialog(true)} 
                variant="ghost" 
                size="sm" 
                className="ml-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white gap-1 h-7 px-3 shadow-sm"
              >
                Upgrade 
                <ArrowRight className="h-3 w-3" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <PlatformSubscriptionDialog 
      open={showDialog} 
      onOpenChange={setShowDialog} 
    />
  );
};
