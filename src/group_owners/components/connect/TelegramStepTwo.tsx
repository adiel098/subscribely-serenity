import React from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TelegramStepTwoProps {
  verificationCode: string;
  copyToClipboard: (text: string) => Promise<void>;
}

export function TelegramStepTwo({ verificationCode, copyToClipboard }: TelegramStepTwoProps) {
  return (
    <motion.div 
      className="flex flex-col gap-3 md:gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-xs md:text-sm shadow-sm">
          2
        </div>
        <h3 className="text-base md:text-xl font-semibold text-gray-900 flex items-center gap-1.5 md:gap-2">
          <Copy className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
          Copy Verification Code
        </h3>
      </div>
      <div className="pl-8 md:pl-10">
        <p className="text-sm md:text-base text-gray-600">
          Copy this verification code and paste it in your Telegram group or channel
        </p>
        <div className="mt-3 md:mt-4 flex flex-col gap-2 md:gap-3">
          <code className="px-4 md:px-6 py-2 md:py-3 bg-indigo-50 rounded-lg text-base md:text-lg font-mono border border-indigo-100 text-indigo-700 w-full text-center break-all">
            {verificationCode}
          </code>
          <Button
            onClick={() => copyToClipboard(verificationCode)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md w-full h-9 md:h-10 text-sm md:text-base"
          >
            <Copy className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            Copy Code
          </Button>
        </div>
        <p className="mt-2 md:mt-3 text-xs md:text-sm text-gray-500 flex items-center">
          <span className="bg-amber-100 text-amber-800 text-[10px] md:text-xs font-medium mr-1.5 md:mr-2 px-2 py-0.5 rounded-full">Note</span>
          The message will be automatically deleted once verified
        </p>
      </div>
    </motion.div>
  );
}
