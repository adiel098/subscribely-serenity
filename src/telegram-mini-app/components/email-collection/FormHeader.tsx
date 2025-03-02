
import React from "react";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FormHeaderProps {
  firstName?: string;
  photoUrl?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ firstName, photoUrl }) => {
  return (
    <div className="space-y-2 text-center">
      {photoUrl ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex justify-center mb-4"
        >
          <Avatar className="h-16 w-16 border-2 border-purple-200">
            <AvatarImage src={photoUrl} alt={firstName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600">
              {firstName ? firstName.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      ) : (
        <motion.div 
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Mail className="h-8 w-8 text-white" />
        </motion.div>
      )}
      
      <motion.h1 
        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-indigo-500 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {firstName ? `Hi ${firstName}! ✨` : "Almost there! ✨"}
      </motion.h1>
      
      <motion.p 
        className="text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Please provide your email address to continue to the community
      </motion.p>
    </div>
  );
};
