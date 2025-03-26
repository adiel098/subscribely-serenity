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
      className="flex flex-col gap-3 md:gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-xs md:text-sm shadow-sm">
          3
        </div>
        <h3 className="text-base md:text-xl font-semibold text-gray-900 flex items-center gap-1.5 md:gap-2">
          <Send className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
          Verify Connection
        </h3>
      </div>
      <div className="pl-8 md:pl-10">
        <p className="text-sm md:text-base text-gray-600">
          After adding the bot and sending the verification code, click below to verify the connection
        </p>
        <Button 
          className="mt-3 md:mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md h-9 md:h-10 text-sm md:text-base w-full md:w-auto"
          onClick={verifyConnection}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <div className="h-3.5 w-3.5 md:h-4 md:w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 md:mr-2"></div>
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
              Verify Connection
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
