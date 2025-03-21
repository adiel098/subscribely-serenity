
import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  // Define animations for the circular search icon
  const containerAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const iconAnimation = {
    hidden: { scale: 0, opacity: 0 },
    show: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.7
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div 
      className="text-center py-8 space-y-4 w-full px-2"
      variants={containerAnimation}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={iconAnimation}
        className="mx-auto"
      >
        <motion.div 
          className="bg-gradient-to-br from-purple-100 to-blue-100 p-5 rounded-full w-24 h-24 mx-auto flex items-center justify-center"
          animate={pulseAnimation}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {searchQuery ? (
            <AlertCircle className="h-10 w-10 text-amber-500 opacity-70" />
          ) : (
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Search className="h-10 w-10 text-primary opacity-70" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      <motion.h3 
        className="text-lg font-medium bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {searchQuery ? "No communities found" : "Search for communities"}
      </motion.h3>
      
      <motion.p 
        className="text-muted-foreground text-sm max-w-sm mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {searchQuery 
          ? `No communities matching "${searchQuery}" that meet the eligibility criteria.` 
          : "Try searching for communities by name or browse our featured communities."}
      </motion.p>
      
      <motion.div
        className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md max-w-sm mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Communities must have active subscription plans and payment methods to appear in search results.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
