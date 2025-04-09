
import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const OnboardingLoading: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <Loader2 className="animate-spin text-indigo-500 h-16 w-16" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-white"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-indigo-500"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">
            Setting up your onboarding experience
          </p>
        </div>
      </motion.div>
    </div>
  );
};
