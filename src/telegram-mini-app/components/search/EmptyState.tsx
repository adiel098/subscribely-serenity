
import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  return (
    <motion.div 
      className="text-center py-10 space-y-5 w-full px-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-5 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
          {searchQuery ? (
            <AlertCircle className="h-10 w-10 text-amber-500 opacity-70" />
          ) : (
            <Search className="h-10 w-10 text-primary opacity-70" />
          )}
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-lg font-medium bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {searchQuery ? "No communities found" : "Search for communities"}
      </motion.h3>
      
      <motion.p 
        className="text-muted-foreground text-sm max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {searchQuery 
          ? `No communities matching "${searchQuery}" that meet the eligibility criteria.` 
          : "Try searching for communities by name or browse our featured communities."}
      </motion.p>
      
      <motion.div
        className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>Communities must have active subscription plans and payment methods to appear in search results.</p>
      </motion.div>
    </motion.div>
  );
};
