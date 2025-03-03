
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
        Payment Methods
      </Badge>
      <h3 className="text-xl font-semibold text-gray-900">
        Select Payment Method
      </h3>
      <p className="text-sm text-muted-foreground">
        Choose your preferred payment option below
      </p>
    </motion.div>
  );
};
