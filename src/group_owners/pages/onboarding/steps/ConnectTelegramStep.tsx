
import React, { useEffect, useState } from "react";
import { Bot, ArrowLeft, ArrowRight, Link, ExternalLink, RefreshCw } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTelegramVerificationState } from "@/group_owners/hooks/onboarding/useTelegramVerificationState";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { ConnectedChannelDisplay } from "@/group_owners/components/onboarding/telegram/ConnectedChannelDisplay";
import { DuplicateChannelError } from "@/group_owners/components/onboarding/telegram/states/DuplicateChannelError";
import { VerificationSuccess } from "@/group_owners/components/onboarding/telegram/states/VerificationSuccess";
import { VerificationInProgress } from "@/group_owners/components/onboarding/telegram/states/VerificationInProgress";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ConnectTelegramStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const ConnectTelegramStep = ({ 
  onComplete, 
  activeStep,
  goToPreviousStep
}: ConnectTelegramStepProps) => {
  const navigate = useNavigate();
  const {
    verificationCode,
    isLoading,
    isVerifying,
    isVerified,
    attemptCount,
    duplicateChatId,
    displayedCommunity,
    isRefreshingPhoto,
    handleRefreshPhoto,
    verifyConnection,
    handleCodeRetry,
    userId,
    useCustomBot,
    customBotToken
  } = useTelegramVerificationState();

  const [customTokenInput, setCustomTokenInput] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

  // For custom bot users who don't have a token set yet
  const needsCustomBotSetup = useCustomBot && !customBotToken;

  // Redirect to telegram bot settings if using custom bot without token
  useEffect(() => {
    if (needsCustomBotSetup) {
      toast.info("You need to set up your custom bot first", {
        description: "You'll be redirected to the bot settings page"
      });
      
      // Short delay before redirect to ensure the toast is seen
      const redirectTimer = setTimeout(() => {
        navigate('/telegram-bot');
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [needsCustomBotSetup, navigate]);

  const validateBotToken = async () => {
    if (!customTokenInput) {
      toast.error("Please enter a valid bot token");
      return;
    }

    setIsValidating(true);
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken: customTokenInput,
          communityId: null // Will be associated with all communities
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        setValidationSuccess(true);
        
        // Save the token
        await supabase.rpc('set_bot_preference', { 
          use_custom: true,
          custom_token: customTokenInput
        });
        
        toast.success("Bot token validated and saved successfully!");
        
        // Reload the page to refresh the state
        window.location.reload();
      } else {
        setValidationSuccess(false);
        toast.error(`Invalid bot token: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error validating bot token:", error);
      setValidationSuccess(false);
      toast.error("Failed to validate bot token. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  if (needsCustomBotSetup) {
    return (
      <OnboardingLayout
        currentStep="connect-telegram"
        title="Custom Bot Setup"
        description="Configure your custom Telegram bot"
        icon={<Bot className="w-6 h-6" />}
        showBackButton={true}
        onBack={goToPreviousStep}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Set Up Your Custom Bot</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bot-token">Bot Token from @BotFather</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bot-token"
                      type="password"
                      value={customTokenInput}
                      onChange={(e) => setCustomTokenInput(e.target.value)}
                      placeholder="Enter your bot token"
                      className="flex-1"
                    />
                    <Button 
                      onClick={validateBotToken} 
                      disabled={isValidating || !customTokenInput}
                    >
                      {isValidating ? "Validating..." : "Validate & Save"}
                    </Button>
                  </div>
                  
                  {validationSuccess === true && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                      <Check className="h-4 w-4" />
                      <span>Bot token validated successfully!</span>
                    </div>
                  )}
                  
                  {validationSuccess === false && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Invalid bot token. Please check and try again.</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium">How to create a Telegram bot:</h4>
                  <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
                    <li>Open Telegram and search for @BotFather</li>
                    <li>Send /newbot command and follow the instructions</li>
                    <li>Copy the API token provided and paste it above</li>
                  </ol>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => window.open('https://t.me/BotFather', '_blank')}
                  >
                    Open BotFather <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </OnboardingLayout>
    );
  }

  if (isVerified) {
    return (
      <OnboardingLayout
        currentStep="connect-telegram"
        title="Telegram Connected"
        description="Your Telegram channel has been successfully connected"
        icon={<Bot className="w-6 h-6" />}
        showBackButton={true}
        onBack={goToPreviousStep}
      >
        <div className="max-w-3xl mx-auto">
          <VerificationSuccess
            community={displayedCommunity}
            onComplete={onComplete}
            isRefreshingPhoto={isRefreshingPhoto}
            onRefreshPhoto={(e) => {
              if (displayedCommunity && displayedCommunity.id) {
                handleRefreshPhoto(e, displayedCommunity.id, displayedCommunity.telegram_chat_id);
              }
            }}
          />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Telegram"
      description={useCustomBot ? "Connect your custom Telegram bot to your community" : "Connect the Membify bot to your Telegram channel or group"}
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="max-w-3xl mx-auto">
        {duplicateChatId ? (
          <DuplicateChannelError 
            duplicateChatId={duplicateChatId} 
            onRetry={handleCodeRetry}
          />
        ) : isVerifying ? (
          <VerificationInProgress />
        ) : (
          <TelegramVerificationForm
            verificationCode={verificationCode}
            isLoading={isLoading}
            isVerifying={isVerifying}
            attemptCount={attemptCount}
            onVerify={verifyConnection}
            onBack={goToPreviousStep}
            showBackButton={true}
            useCustomBot={useCustomBot}
            customBotToken={customBotToken}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
