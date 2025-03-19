
import React from 'react';
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface TelegramVerificationErrorProps {
  showError: boolean;
  errorCount: number;
}

export const TelegramVerificationError: React.FC<TelegramVerificationErrorProps> = ({
  showError,
  errorCount
}) => {
  if (!showError) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Alert className="border-red-100 bg-red-50 text-red-800 py-3 px-4 text-sm">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-800 font-semibold text-base flex items-center gap-2">
          Verification Failed
        </AlertTitle>
        <AlertDescription className="text-red-700 text-xs">
          <p className="mt-1">We couldn't verify your Telegram group connection. Please make sure:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>You've added the @MembifyBot as an admin with delete messages and ban users permissions</li>
            <li>You've posted the exact verification code shown above in your group</li>
            <li>The message with the code hasn't been deleted</li>
            {errorCount > 2 && (
              <li className="font-medium">Try creating a new message with the verification code instead of editing a previous one</li>
            )}
          </ul>
          {errorCount > 3 && (
            <p className="mt-2 p-1.5 bg-red-100 rounded-md text-red-800 border border-red-200 text-xs">
              If you're still having issues, please contact our support team for assistance.
            </p>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};
