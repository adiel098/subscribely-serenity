import React, { useState } from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Bot, ArrowLeft, ChevronRight, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BotTokenInput } from "@/group_owners/components/onboarding/custom-bot/BotTokenInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface BotSetupStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const BotSetupStep: React.FC<BotSetupStepProps> = ({
  onComplete,
  activeStep,
  goToPreviousStep
}) => {
  const [botToken, setBotToken] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { toast: toastNotify } = useToast();
  
  const handleVerify = async () => {
    if (!botToken.trim()) {
      toastNotify({
        variant: "destructive",
        title: "Bot token required",
        description: "Please enter your Telegram bot token"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { botToken: botToken.trim() }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.valid) {
        const { error: saveError } = await supabase.rpc('set_bot_preference', { 
          use_custom: true,
          custom_token: botToken.trim()
        });
        
        if (saveError) {
          throw new Error(`Failed to save bot token: ${saveError.message}`);
        }
        
        setIsVerified(true);
        toastNotify({
          title: "Bot verified successfully!",
          description: "Your bot token has been validated and saved",
          duration: 3000,
        });
        
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        throw new Error(response.data.message || "Invalid bot token");
      }
    } catch (error: any) {
      console.error("Error validating bot token:", error);
      setVerificationError(error.message || "Failed to validate bot token");
      toastNotify({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Please check your bot token and try again",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Connect Your Telegram Bot 🤖"
      description="Your bot will manage access to your communities"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="space-y-6">
            <BotTokenInput
              customTokenInput={botToken}
              setCustomTokenInput={setBotToken}
              disabled={isVerifying || isVerified}
            />
            
            <div className="space-y-3">
              <h4 className="font-medium">How to create a Telegram bot:</h4>
              <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                <li>Send the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 text-sm">/newbot</code> command and follow the instructions</li>
                <li>BotFather will provide a token that looks like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 text-sm">123456789:AAExampleToken</code></li>
                <li>Copy the API token provided and paste it above</li>
              </ol>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://t.me/BotFather', '_blank')}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
                disabled={isVerifying}
              >
                <Bot className="h-4 w-4" />
                Open @BotFather in Telegram
              </Button>
            </div>
          </div>
        </div>

        {verificationError && (
          <Alert variant="destructive">
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{verificationError}</AlertDescription>
          </Alert>
        )}

        {isVerified && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Bot Verified Successfully!</AlertTitle>
            <AlertDescription>
              Your bot is valid and has been connected to your account.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isVerifying || isVerified}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleVerify}
            disabled={isVerifying || isVerified || !botToken.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : isVerified ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Verified
              </>
            ) : (
              <>
                Verify & Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};

export default BotSetupStep;
