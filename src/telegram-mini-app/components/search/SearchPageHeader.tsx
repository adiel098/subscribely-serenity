
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const SearchPageHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-5 text-center py-4"
    >
      <div className="relative inline-block">
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.5, 
            type: "spring",
            stiffness: 200
          }}
          className="absolute -top-6 -right-4 transform"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [12, 20, 12],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
          </motion.div>
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-extrabold tracking-tight"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            type: "spring",
            stiffness: 200
          }}
        >
          <motion.span 
            className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "linear" 
            }}
            style={{ backgroundSize: "200% auto" }}
          >
            Membify
          </motion.span>
        </motion.h1>
        
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.5, 
            type: "spring",
            stiffness: 200
          }}
          className="absolute -bottom-4 -left-4 transform"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [-12, -20, -12],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
          Find and join amazing Telegram communities with premium content
        </p>
      </motion.div>
      
      <motion.div 
        className="mt-4 h-1 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full mx-auto"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "4rem", opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </motion.div>
  );
};
