
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";

export const PaymentHeader = () => {
  return (
    <motion.div
      className="text-center space-y-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Badge variant="secondary" className="px-5 py-2 text-base font-medium bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20">
        <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
        Choose Payment Method <Sparkles className="h-4 w-4 ml-1 text-amber-500" />
      </Badge>
      <p className="text-sm text-gray-600">Select your preferred payment option below to continue</p>
    </motion.div>
  );
};
