
import React from "react";
import { Clipboard, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TelegramVerificationError } from "./TelegramVerificationError";
import { useToast } from "@/hooks/use-toast";

interface TelegramVerificationFormProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  onVerify: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  hasExistingCommunities?: boolean;
  onContinueWithExisting?: () => void;
}

export const TelegramVerificationForm: React.FC<TelegramVerificationFormProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  onVerify,
  onBack,
  showBackButton = false,
  hasExistingCommunities = false,
  onContinueWithExisting
}) => {
  const { toast } = useToast();
  
  const copyCodeToClipboard = async () => {
    if (!verificationCode) return;
    
    try {
      await navigator.clipboard.writeText(verificationCode);
      toast({
        title: "Code copied!",
        description: "Verification code copied to clipboard"
      });
    } catch (err) {
      console.error("Failed to copy code:", err);
      toast({
        title: "Could not copy code",
        description: "Please copy it manually",
        variant: "destructive"
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {attemptCount > 1 && (
        <TelegramVerificationError 
          showError={attemptCount > 1}
          errorCount={attemptCount}
          troubleshootingSteps={[
            "Make sure you've added @MembifyBot as an admin to your channel or group",
            "Ensure the bot has permission to post messages",
            "Try posting the verification code as a new message (don't edit an existing message)"
          ]}
        />
      )}
      
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6 space-y-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Connect Your Telegram Channel</h3>
          <p className="text-sm text-gray-600">
            Follow these steps to connect your channel or group:
          </p>
        </div>
        
        <ol className="space-y-4 text-sm">
          <li className="flex gap-2">
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
              1
            </div>
            <div>
              <p className="text-gray-700">Add <Badge variant="outline" className="font-mono ml-1 text-xs bg-gray-50">@MembifyBot</Badge> as an <strong>admin</strong> to your Telegram channel or group</p>
            </div>
          </li>
          
          <li className="flex gap-2">
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
              2
            </div>
            <div className="flex-1">
              <p className="text-gray-700">Post this verification code in your channel:</p>
              
              {isLoading ? (
                <Skeleton className="h-10 w-full mt-2" />
              ) : (
                <div className="flex items-center mt-2">
                  <code className="flex-1 bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100 font-mono text-sm break-all">
                    {verificationCode || "Loading verification code..."}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-full"
                    onClick={copyCodeToClipboard}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </li>
          
          <li className="flex gap-2">
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
              3
            </div>
            <div>
              <p className="text-gray-700">Click "Verify Connection" after posting the code in your channel</p>
            </div>
          </li>
        </ol>
        
        <Alert className="bg-blue-50 border-blue-100 text-blue-800">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs text-blue-700">
            This verification step ensures that you are the admin of the channel you're connecting. Your channel remains private and secure.
          </AlertDescription>
        </Alert>
        
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {showBackButton && onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-gray-200 text-gray-700"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button 
            onClick={onVerify} 
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
            disabled={isVerifying || !verificationCode}
            size="lg"
          >
            {isVerifying ? "Verifying..." : "Verify Connection"}
          </Button>
          
          {hasExistingCommunities && onContinueWithExisting && (
            <Button 
              variant="outline"
              onClick={onContinueWithExisting}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              size="lg"
            >
              Continue with Existing Communities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
