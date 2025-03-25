
import React, { useState } from "react";
import { Bot, ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BotTokenInput } from "@/group_owners/components/onboarding/custom-bot/BotTokenInput";
import { TelegramChat } from "@/group_owners/components/onboarding/custom-bot/TelegramChatItem";
import { TelegramChatsList } from "@/group_owners/components/onboarding/custom-bot/TelegramChatsList";

const CustomBotNewCommunity: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customTokenInput, setCustomTokenInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<TelegramChat[] | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  const handleSaveCommunities = async () => {
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
                is_group: false,
                owner_id: user.id
              })
              .select('id')
              .single();
              
            if (communityError) {
              console.error("Error saving community:", communityError);
              toast.error(`Failed to save community: ${chat.title}`);
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
        }
      }
      
      if (savedCommunities.length === 0 && verificationResults.length > 0) {
        toast.warning("No communities were saved. Please try again.");
        setIsSaving(false);
        return;
      }
      
      toast.success(`Successfully added ${savedCommunities.length} communities!`);
      
      // Navigate to dashboard after a short delay to allow state updates
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error) {
      console.error("Error saving communities:", error);
      toast.error("Failed to save communities");
      setIsSaving(false);
    }
  };

  const handleChatsRefresh = (newChats: TelegramChat[]) => {
    setVerificationResults(newChats);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Community</h1>
          <p className="text-gray-600">Configure your custom bot to add a new Telegram community</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl">
            <div className="flex items-center mb-6 gap-2 text-blue-600">
              <Bot className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Add New Telegram Community</h3>
            </div>
            
            <div className="space-y-6 mb-8">
              <BotTokenInput 
                customTokenInput={customTokenInput} 
                setCustomTokenInput={setCustomTokenInput}
              />
              
              <div className="space-y-3">
                <h4 className="font-medium">Custom Bot Instructions:</h4>
                <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
                  <li>Make sure your bot is an admin in the Telegram groups or channels you want to add</li>
                  <li>Enter your bot token and click "Verify Connection"</li>
                  <li>Select the communities you want to add</li>
                  <li>Click "Save Communities" to complete the process</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-blue-700">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Your bot token is securely stored and encrypted</li>
                      <li>Ensure your bot has admin privileges in your Telegram communities</li>
                      <li>New users can only be added through the bot once you set up subscriptions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {verificationResults && (
              <TelegramChatsList 
                chats={verificationResults} 
                botToken={customTokenInput}
                onChatsRefresh={handleChatsRefresh}
                disabled={isSaving}
              />
            )}
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5"
                disabled={isSaving}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleVerifyConnection}
                  disabled={!customTokenInput || isVerifying || isSaving}
                  className="flex items-center gap-1.5"
                >
                  <Bot className="h-4 w-4" />
                  {isVerifying ? 'Verifying...' : 'Verify Connection'}
                </Button>
                
                <Button
                  onClick={handleSaveCommunities}
                  disabled={!verificationResults || verificationResults.length === 0 || isSaving}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSaving ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Communities
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomBotNewCommunity;
