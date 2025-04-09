import React, { useState } from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Bot } from "lucide-react";
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
  const [customTokenInput, setCustomTokenInput] = useState("");
  const tempData = getTempOnboardingData();
  const { user } = useAuth();

  const form = useForm<BotSetupFormData>({
    resolver: zodResolver(botSetupSchema),
    defaultValues: {
      bot_token: tempData.project?.bot_token || ""
    }
  });

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
        setVerificationResults(response.data.chatList || []);
        
        const channelCount = (response.data.chatList || []).filter(chat => chat.type === 'channel').length;
        const groupCount = (response.data.chatList || []).filter(chat => chat.type !== 'channel').length;
        
        if (response.data.chatList && response.data.chatList.length > 0) {
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
    try {
      // Check if a project with this bot token already exists
      const { data: existingProject } = await supabase
        .from("projects")
        .select("id, name")
        .eq("bot_token", customTokenInput)
        .single();

      if (existingProject) {
        toast.error(`A project with this bot token already exists: ${existingProject.name}`);
        setIsSubmitting(false);
        return;
      }

      // Use the project name that was already set in the previous step
      setTempProjectData({
        ...tempData.project,
        bot_token: customTokenInput,
        communities: verificationResults || []
      });

      console.log("✅ Bot Setup: Saved temporary project data:", {
        name: tempData.project?.name,
        botTokenSet: !!customTokenInput,
        communitiesCount: verificationResults?.length || 0
      });

      // Call commitOnboardingData
      const success = await commitOnboardingData();
      
      if (!success) {
        throw new Error("Failed to commit onboarding data");
      }

      console.log("✅ Bot Setup: Successfully committed onboarding data");
      
      // Proceed to the next step
      onComplete();
    } catch (error: any) {
      console.error("❌ Bot Setup: Error in continue process:", error);
      toast.error(error.message || "Failed to save bot settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatsRefresh = (newChats: TelegramChat[]) => {
    setVerificationResults(newChats);
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
      />
    </OnboardingLayout>
  );
};

export default BotSetupStep;
