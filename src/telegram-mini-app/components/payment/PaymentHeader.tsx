
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";

export const PaymentHeader = () => {
  return (
    <motion.div
      className="text-center space-y-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Badge variant="secondary" className="px-4 py-1.5 text-base font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <CreditCard className="h-4 w-4 mr-1.5 text-purple-500" />
        Choose Payment Method ✨
      </Badge>
      <p className="text-xs text-gray-600">Select your preferred payment option 💳</p>
    </motion.div>
  );
};
