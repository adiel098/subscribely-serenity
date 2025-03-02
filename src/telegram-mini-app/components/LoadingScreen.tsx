
import React, { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Track loading time
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Determine loading message based on time
  const getLoadingMessage = () => {
    if (loadingTime > 10) {
      return "Still loading, please be patient";
    } else {
      return "Loading amazing content";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      <motion.div 
        className="text-center space-y-6 p-8 rounded-2xl max-w-md bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h3 
          className="text-xl font-medium text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {getLoadingMessage()}
        </motion.h3>
        
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </motion.div>
        
        {loadingTime > 5 && (
          <motion.p 
            className="text-xs text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            If loading persists, try refreshing the page
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};
