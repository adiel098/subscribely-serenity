
import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export const SuccessHeader = () => {
  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mx-auto bg-green-100 p-4 rounded-full w-24 h-24 flex items-center justify-center"
      >
        <Check className="h-12 w-12 text-green-600" strokeWidth={3} />
      </motion.div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Thank you for your purchase. Your subscription has been activated. 
          You can now join the community using the link below.
        </p>
      </div>
    </div>
  );
};
