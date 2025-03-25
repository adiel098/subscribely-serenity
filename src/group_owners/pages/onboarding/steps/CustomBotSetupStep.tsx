
import React, { useState } from "react";
import { Bot } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { CustomBotSetupCard } from "@/group_owners/components/onboarding/custom-bot/CustomBotSetupCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TelegramChat } from "@/group_owners/components/onboarding/custom-bot/TelegramChatItem";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customTokenInput, setCustomTokenInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<TelegramChat[] | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Store the token and communities when completing this step
  const handleContinue = async () => {
    if (!customTokenInput) {
      toast.error("Please enter your bot token");
      return;
    }
    
    if (!user) {
      toast.error("Authentication required. Please login again.");
      return;
    }
    
    if (!verificationResults || verificationResults.length === 0) {
      toast.error("Please verify your bot connection and detect at least one channel or group");
      return;
    }
    
    try {
      setIsSaving(true);
      console.log("Starting save process for user:", user.id);
      
      // Save the token
      const { error: tokenError } = await supabase.rpc('set_bot_preference', { 
        use_custom: true,
        custom_token: customTokenInput
      });
      
      if (tokenError) {
        console.error("Error saving bot token:", tokenError);
        throw tokenError;
      }
      
      console.log("Bot token saved successfully");
      
      // Save each detected community/channel to the database
      const savedCommunities = [];
      for (const chat of verificationResults) {
        try {
          // Check if community already exists with this chat ID
          const { data: existingCommunity } = await supabase
            .from('communities')
            .select('id')
            .eq('telegram_chat_id', chat.id)
            .eq('owner_id', user.id)
            .maybeSingle();
            
          if (!existingCommunity) {
            // Create new community record
            console.log("Creating new community:", chat.title);
            const { data: newCommunity, error: communityError } = await supabase
              .from('communities')
              .insert({
                name: chat.title,
                telegram_chat_id: chat.id,
                telegram_photo_url: chat.photo_url || null,
                is_group: chat.type !== 'channel',
                owner_id: user.id // Make sure to set the owner_id to comply with RLS policies
              })
              .select('id')
              .single();
              
            if (communityError) {
              console.error("Error saving community:", communityError);
              toast.error(`Failed to save community: ${chat.title}`);
              // Continue with other communities even if one fails
            } else {
              savedCommunities.push(newCommunity);
              console.log("Community saved successfully:", newCommunity);
            }
          } else {
            console.log("Community already exists:", existingCommunity);
            savedCommunities.push(existingCommunity);
          }
        } catch (communityError) {
          console.error("Error processing community:", chat.title, communityError);
          // Continue with other communities
        }
      }
      
      if (savedCommunities.length === 0 && verificationResults.length > 0) {
        toast.warning("No communities were saved. Please try again.");
        setIsSaving(false);
        return;
      }
      
      // Mark onboarding as completed
      await supabase.from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 'complete'
        })
        .eq('id', user.id);
      
      toast.success("Setup completed successfully!");
      
      // Use the onComplete callback to ensure proper state updates in parent components
      onComplete();
      
      // Navigate to dashboard after a short delay to allow state updates
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error) {
      console.error("Error saving bot token and communities:", error);
      toast.error("Failed to complete setup");
      setIsSaving(false);
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
          isSaving={isSaving}
        />
      </div>
    </OnboardingLayout>
  );
};

export default CustomBotSetupStep;
