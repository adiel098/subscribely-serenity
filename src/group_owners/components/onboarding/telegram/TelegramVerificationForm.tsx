
import React from "react";
import { Clipboard, Info, ArrowLeft, ArrowRight, Copy, Bot, Send, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TelegramVerificationError } from "./TelegramVerificationError";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface TelegramVerificationFormProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  onVerify: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const TelegramVerificationForm: React.FC<TelegramVerificationFormProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  onVerify,
  onBack,
  showBackButton = false
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
      
      <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl overflow-hidden">
        <div className="space-y-10">
          {/* Step 1 */}
          <motion.div 
            className="flex flex-col md:flex-row gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex-shrink-0 flex items-start">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                1
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-600" />
                Add our bot to your group
              </h3>
              <p className="mt-2 text-gray-600">
                Add <a 
                  href="https://t.me/membifybot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-medium hover:text-indigo-800 underline decoration-2 decoration-indigo-300 underline-offset-2"
                >
                  @MembifyBot
                </a> to your Telegram group or channel and make it an administrator with these permissions:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center text-gray-700">
                  <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Delete messages</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Ban users</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Add new admins</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="flex flex-col md:flex-row gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex-shrink-0 flex items-start">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                2
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Copy className="h-5 w-5 text-indigo-600" />
                Copy Verification Code
              </h3>
              <p className="mt-2 text-gray-600">
                Copy this verification code and paste it in your Telegram group or channel
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <code className="px-6 py-3 bg-indigo-50 rounded-lg text-lg font-mono border border-indigo-100 text-indigo-700 w-full sm:w-auto text-center">
                  {verificationCode || "Loading..."}
                </code>
                <Button
                  onClick={copyCodeToClipboard}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md w-full sm:w-auto"
                  disabled={!verificationCode || isLoading}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </div>
              <p className="mt-3 text-sm text-gray-500 flex items-center">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Note</span>
                The message will be automatically deleted once verified
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
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
              <div className="mt-4 flex flex-row gap-3 items-center">
                {showBackButton && (
                  <Button 
                    variant="outline"
                    onClick={onBack}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                )}
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                  onClick={onVerify}
                  disabled={isVerifying || !verificationCode || isLoading}
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
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
