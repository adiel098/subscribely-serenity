
import React from 'react';
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface TelegramVerificationErrorProps {
  title?: string;
  description?: string;
  troubleshootingSteps?: string[];
  showError?: boolean;
  errorCount?: number;
  onBack?: () => void;
}

export const TelegramVerificationError: React.FC<TelegramVerificationErrorProps> = ({
  title = "Verification Failed",
  description = "We couldn't verify your Telegram group connection.",
  troubleshootingSteps = [],
  showError = true,
  errorCount = 0,
  onBack
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
          {title}
        </AlertTitle>
        <AlertDescription className="text-red-700 text-xs">
          <p className="mt-1">{description}</p>
          {troubleshootingSteps.length > 0 && (
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {troubleshootingSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
              {errorCount > 2 && (
                <li className="font-medium">Try creating a new message with the verification code instead of editing a previous one</li>
              )}
            </ul>
          )}
          {errorCount > 3 && (
            <p className="mt-2 p-1.5 bg-red-100 rounded-md text-red-800 border border-red-200 text-xs">
              If you're still having issues, please contact our support team for assistance.
            </p>
          )}
          
          {onBack && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack} 
                className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs h-8"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Try again
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};
