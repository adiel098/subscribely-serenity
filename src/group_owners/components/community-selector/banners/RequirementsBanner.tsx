
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CreditCard, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequirementsBannerProps {
  hasPlans: boolean;
  hasActivePaymentMethods: boolean;
  onNavigateToSubscriptions: () => void;
  onNavigateToPaymentMethods: () => void;
}

export const RequirementsBanner: React.FC<RequirementsBannerProps> = ({
  hasPlans,
  hasActivePaymentMethods,
  onNavigateToSubscriptions,
  onNavigateToPaymentMethods,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 bg-white/90 border border-red-300 rounded-lg px-3 py-2 shadow-sm"
    >
      <div className="flex-shrink-0 text-red-500">
        <AlertTriangle className="h-4 w-4" />
      </div>
      
      <div className="text-sm text-red-600 font-medium">
        <span>Setup required to onboard members</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {!hasPlans && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onNavigateToSubscriptions} 
              variant="ghost" 
              size="sm" 
              className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white gap-1 h-7 px-3 shadow-sm"
            >
              <Package className="h-3.5 w-3.5" />
              Plans
              <ArrowRight className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
        
        {!hasActivePaymentMethods && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onNavigateToPaymentMethods} 
              variant="ghost" 
              size="sm" 
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white gap-1 h-7 px-3 shadow-sm"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Payments
              <ArrowRight className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
