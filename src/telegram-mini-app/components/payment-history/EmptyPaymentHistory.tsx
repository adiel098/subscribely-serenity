
import React from "react";
import { Receipt, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface EmptyPaymentHistoryProps {
  onDiscoverClick?: () => void;
}

export const EmptyPaymentHistory: React.FC<EmptyPaymentHistoryProps> = ({
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
        icon={<Receipt className="h-10 w-10 text-primary/70" />}
        title="No Payment History"
        description="You haven't made any payments yet. Subscribe to communities to start tracking your payment history."
        action={
          onDiscoverClick && (
            <Button 
              onClick={onDiscoverClick}
              className="mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Browse Communities
            </Button>
          )
        }
        className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border shadow-sm"
      />
    </motion.div>
  );
};
