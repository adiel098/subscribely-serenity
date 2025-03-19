
import React from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TelegramStepThreeProps {
  isVerifying: boolean;
  verifyConnection: () => Promise<void>;
}

export function TelegramStepThree({ isVerifying, verifyConnection }: TelegramStepThreeProps) {
  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex-shrink-0 flex items-start">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
          3
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Send className="h-5 w-5 text-indigo-600" />
          Verify Connection
        </h3>
        <p className="mt-2 text-gray-600">
          After adding the bot and sending the verification code, click below to verify the connection
        </p>
        <Button 
          className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
          onClick={verifyConnection}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Verify Connection
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
