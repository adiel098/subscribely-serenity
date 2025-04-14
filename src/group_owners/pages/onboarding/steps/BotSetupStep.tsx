
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Bot, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TelegramChat } from "@/group_owners/components/onboarding/custom-bot/TelegramChatItem";
import { getTempOnboardingData, setTempProjectData, commitOnboardingData } from "@/group_owners/hooks/useCreateCommunityGroup";
import { CustomBotSetupCard } from "@/group_owners/components/onboarding/custom-bot/CustomBotSetupCard";
import { useAuth } from "@/auth/contexts/AuthContext";

const botSetupSchema = z.object({
  bot_token: z.string().min(40, "Bot token must be valid").max(100, "Bot token is too long")
});

type BotSetupFormData = z.infer<typeof botSetupSchema>;

interface BotSetupStepProps {
  onComplete: () => void;
  goToPreviousStep: () => void;
  activeStep: boolean;
}

const BotSetupStep: React.FC<BotSetupStepProps> = ({ 
  onComplete, 
  goToPreviousStep,
  activeStep 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<TelegramChat[] | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [customTokenInput, setCustomTokenInput] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const tempData = getTempOnboardingData();
  const { user } = useAuth();

  const form = useForm<BotSetupFormData>({
    resolver: zodResolver(botSetupSchema),
    defaultValues: {
      bot_token: tempData.project?.bot_token || ""
    }
  });

  // Load saved token on component mount
  useEffect(() => {
    if (tempData.project?.bot_token) {
      setCustomTokenInput(tempData.project.bot_token);
    }
  }, []);

  // Save the bot token immediately when it changes for persistence
  useEffect(() => {
    if (customTokenInput && customTokenInput.length > 10) {
      const currentData = getTempOnboardingData();
      setTempProjectData({
        ...currentData.project,
        bot_token: customTokenInput
      });
    }
  }, [customTokenInput]);

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
          projectId: null
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        const chatList = response.data.chatList || [];
        setVerificationResults(chatList);
        
        // Automatically save the communities and bot token in temp data
        const currentData = getTempOnboardingData();
        setTempProjectData({
          ...currentData.project,
          bot_token: customTokenInput,
          communities: chatList
        });
        
        console.log("✅ Bot verification successful. Saved communities:", {
          count: chatList.length,
          communities: chatList.map(c => ({id: c.id, title: c.title}))
        });
        
        const channelCount = chatList.filter(chat => chat.type === 'channel').length;
        const groupCount = chatList.filter(chat => chat.type !== 'channel').length;
        
        if (chatList.length > 0) {
          let successMessage = `Bot verified successfully!`;
          if (channelCount > 0 && groupCount > 0) {
            successMessage += ` Found ${channelCount} ${channelCount === 1 ? 'channel' : 'channels'} and ${groupCount} ${groupCount === 1 ? 'group' : 'groups'}.`;
          } else if (channelCount > 0) {
            successMessage += ` Found ${channelCount} ${channelCount === 1 ? 'channel' : 'channels'}.`;
          } else if (groupCount > 0) {
            successMessage += ` Found ${groupCount} ${groupCount === 1 ? 'group' : 'groups'}.`;
          }
          toast.success(successMessage);
        } else {
          toast.warning("Bot token is valid, but no channels or groups were found. Make sure your bot is an admin in at least one group or channel.");
        }
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
    
    // Save the updated communities in temp data
    const currentData = getTempOnboardingData();
    setTempProjectData({
      ...currentData.project,
      communities: newChats
    });
    
    console.log("Updated communities in temporary data:", {
      count: newChats.length,
      communities: newChats.map(c => ({id: c.id, title: c.title}))
    });
  };

  const commitDataWithRetry = async (maxRetries = 3): Promise<{success: boolean, projectId?: string, error?: string}> => {
    setCommitError(null);
    let retryAttempt = 0;
    
    while (retryAttempt < maxRetries) {
      try {
        console.log(`🔄 Commit attempt ${retryAttempt + 1} of ${maxRetries}`);
        
        // Try to commit the data
        const result = await commitOnboardingData();
        
        if (result.success) {
          console.log(`✅ Commit successful on attempt ${retryAttempt + 1}`);
          return { success: true, projectId: result.projectId };
        } else {
          console.warn(`⚠️ Commit failed on attempt ${retryAttempt + 1}: ${result.error}`);
          // Increment retry counter
          retryAttempt++;
          
          // Wait longer between each retry
          await new Promise(resolve => setTimeout(resolve, 2000 * retryAttempt));
        }
      } catch (error: any) {
        console.error(`❌ Error during commit attempt ${retryAttempt + 1}:`, error);
        retryAttempt++;
        await new Promise(resolve => setTimeout(resolve, 2000 * retryAttempt));
      }
    }
    
    return { 
      success: false, 
      error: `Failed to save data after ${maxRetries} attempts. Please try again later.` 
    };
  };

  const handleContinue = async () => {
    if (!user?.id) {
      console.error("❌ Bot Setup: User not authenticated");
      toast.error("User not authenticated");
      return;
    }

    console.log("🤖 Bot Setup: Starting continue process for user:", {
      userId: user.id,
      email: user.email
    });

    setIsSubmitting(true);
    setCommitError(null);
    
    try {
      // Make sure communities are explicitly set before continuing
      if (verificationResults && verificationResults.length > 0) {
        const currentData = getTempOnboardingData();
        setTempProjectData({
          ...currentData.project,
          bot_token: customTokenInput,
          communities: verificationResults
        });

        console.log("🤖 Bot Setup: Saving communities:", {
          count: verificationResults.length,
          communities: verificationResults.map(c => ({id: c.id, title: c.title}))
        });
      } else {
        console.log("⚠️ Bot Setup: No communities found to save");
        if (!tempData.project?.communities || tempData.project.communities.length === 0) {
          toast.warning("No communities were found. Please verify your bot token and make sure your bot is added as an admin to at least one group or channel.");
          setIsSubmitting(false);
          return;
        }
      }

      // Double check that communities are properly saved in tempData
      const finalCheck = getTempOnboardingData();
      console.log("Final data check before commit:", {
        botToken: !!finalCheck.project?.bot_token,
        communitiesCount: finalCheck.project?.communities?.length || 0
      });

      // Try to commit with retries
      const commitResult = await commitDataWithRetry(3);
      
      if (!commitResult.success) {
        setCommitError(commitResult.error || "An error occurred while saving your project");
        throw new Error(commitResult.error);
      }

      console.log("✅ Bot Setup: Successfully committed onboarding data with project ID:", commitResult.projectId);
      
      // Only proceed to the next step if commit was successful
      onComplete();
    } catch (error: any) {
      console.error("❌ Bot Setup: Error in continue process:", error);
      setCommitError(error.message || "Failed to save bot settings");
      toast.error(error.message || "Failed to save bot settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Set Up Your Telegram Bot"
      description="Connect your bot to enable payment processing and member management"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
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
        isSaving={isSubmitting}
        commitError={commitError}
      />
      
      {commitError && (
        <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Error saving your project</h4>
              <p className="text-sm text-red-600 mt-1">{commitError}</p>
              <p className="text-xs text-red-500 mt-2">
                This could be due to a temporary database issue. Please try again or contact support if the problem persists.
              </p>
            </div>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default BotSetupStep;
