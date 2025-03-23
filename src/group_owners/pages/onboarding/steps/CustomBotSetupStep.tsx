
import React, { useState } from "react";
import { Bot } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { CustomBotSetupCard } from "@/group_owners/components/onboarding/custom-bot/CustomBotSetupCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TelegramChat } from "@/group_owners/components/onboarding/custom-bot/TelegramChatItem";

interface CustomBotSetupStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const CustomBotSetupStep = ({
  onComplete,
  activeStep,
  goToPreviousStep
}: CustomBotSetupStepProps) => {
  const [customTokenInput, setCustomTokenInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<TelegramChat[] | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Store the token when completing this step
  const handleContinue = async () => {
    if (!customTokenInput) {
      toast.error("Please enter your bot token");
      return;
    }
    
    try {
      // Save the token
      await supabase.rpc('set_bot_preference', { 
        use_custom: true,
        custom_token: customTokenInput
      });
      
      // Continue to next step
      onComplete();
    } catch (error) {
      console.error("Error saving bot token:", error);
      toast.error("Failed to save bot token");
    }
  };

  const handleVerifyConnection = async () => {
    if (!customTokenInput) {
      toast.error("Please enter your bot token");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    
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
        setVerificationResults(response.data.chatList || []);
        
        const channelCount = (response.data.chatList || []).filter(chat => chat.type === 'channel').length;
        const groupCount = (response.data.chatList || []).filter(chat => chat.type !== 'channel').length;
        
        let successMessage = `Bot token verified successfully!`;
        if (response.data.chatList && response.data.chatList.length > 0) {
          if (channelCount > 0 && groupCount > 0) {
            successMessage += ` Found ${channelCount} ${channelCount === 1 ? 'channel' : 'channels'} and ${groupCount} ${groupCount === 1 ? 'group' : 'groups'}.`;
          } else if (channelCount > 0) {
            successMessage += ` Found ${channelCount} ${channelCount === 1 ? 'channel' : 'channels'}.`;
          } else if (groupCount > 0) {
            successMessage += ` Found ${groupCount} ${groupCount === 1 ? 'group' : 'groups'}.`;
          }
        }
        
        toast.success(successMessage);
      } else {
        setVerificationError(response.data.message || "Invalid bot token");
        toast.error(`Invalid bot token: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error("Error validating bot token:", error);
      setVerificationError(error.message || "Failed to validate bot token");
      toast.error("Failed to validate bot token. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChatsRefresh = (newChats: TelegramChat[]) => {
    setVerificationResults(newChats);
  };

  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Custom Bot Setup"
      description="Configure your custom Telegram bot"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="max-w-3xl mx-auto">
        <CustomBotSetupCard
          customTokenInput={customTokenInput}
          setCustomTokenInput={setCustomTokenInput}
          goToPreviousStep={goToPreviousStep}
          onContinue={handleContinue}
          onVerifyConnection={handleVerifyConnection}
          isVerifying={isVerifying}
          verificationResults={verificationResults}
          verificationError={verificationError}
          onChatsRefresh={handleChatsRefresh}
        />
      </div>
    </OnboardingLayout>
  );
};

export default CustomBotSetupStep;
