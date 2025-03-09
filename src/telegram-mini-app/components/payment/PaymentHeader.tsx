
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

export const PaymentHeader = () => {
  return (
    <motion.div
      className="text-center space-y-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Badge variant="secondary" className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <CreditCard className="h-3 w-3 mr-1 text-primary" />
        Choose Payment Method
      </Badge>
      <h3 className="text-lg font-medium text-gray-900">
        Choose Payment Method
      </h3>
      <p className="text-sm text-muted-foreground">
        After payment, you'll receive an invite link to join the community
      </p>
    </motion.div>
  );
};
