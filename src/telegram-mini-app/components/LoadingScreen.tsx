
import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-full w-16 h-16 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </motion.div>
    </div>
  );
};
