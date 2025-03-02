
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Gift, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export const PaymentHeader = () => {
  return (
    <motion.div 
      className="text-center space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Badge variant="secondary" className="px-4 py-1.5 bg-gradient-to-r from-green-500/20 to-blue-500/20">
        <Gift className="h-4 w-4 mr-2 text-green-500" />
        Final Step
      </Badge>
      <h2 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Choose Payment Method
      </h2>
      <p className="text-gray-600">
        Select your preferred way to pay 💳
      </p>
      <motion.div
        className="flex justify-center mt-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20, 
          delay: 0.3 
        }}
      >
        <div className="p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-full border border-green-100">
          <CreditCard className="h-10 w-10 text-green-500" />
        </div>
      </motion.div>
    </motion.div>
  );
};
