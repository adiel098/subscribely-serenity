
import React from "react";
import { Crown, Package } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface EmptySubscriptionsStateProps {
  onDiscoverClick?: () => void;
}

export const EmptySubscriptionsState: React.FC<EmptySubscriptionsStateProps> = ({ 
  onDiscoverClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="py-6"
    >
      <EmptyState
        icon={<Crown className="h-10 w-10 text-primary/70" />}
        title="No Active Subscriptions"
        description="You don't have any active subscriptions yet. Explore available communities to find groups that interest you."
        action={
          onDiscoverClick && (
            <Button 
              onClick={onDiscoverClick}
              className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Discover Communities
            </Button>
          )
        }
        className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border shadow-sm"
      />
    </motion.div>
  );
};
