
import React from "react";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <motion.div 
      className="p-4 bg-red-50 text-red-700 rounded-md m-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>{message}</span>
      </div>
    </motion.div>
  );
};
