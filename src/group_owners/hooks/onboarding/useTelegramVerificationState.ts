
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useTelegramVerificationState = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [duplicateChatId, setDuplicateChatId] = useState<string | null>(null);
  const [displayedCommunity, setDisplayedCommunity] = useState<any | null>(null);
  const [isRefreshingPhoto, setIsRefreshingPhoto] = useState(false);
  const [customBotToken, setCustomBotToken] = useState<string | null>(null);
  const [useCustomBot, setUseCustomBot] = useState(false);
  
  // Get or generate verification code when component mounts
  useEffect(() => {
    if (!user) return;
    
    const getOrGenerateCode = async () => {
      setIsLoading(true);
      setUserId(user.id);
      
      try {
        // Check if user is using custom bot
        const { data: botSettings, error: botSettingsError } = await supabase
          .rpc('get_bot_preference');

        if (botSettingsError) {
          console.error("Failed to get bot preference:", botSettingsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get bot preferences"
          });
        } else if (botSettings) {
          setUseCustomBot(botSettings.use_custom_bot || false);
          setCustomBotToken(botSettings.custom_bot_token);
        }
        
        // Get existing verification code or generate a new one
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_telegram_code')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Failed to get profile:", profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get verification code"
          });
          return;
        }

        if (profile.current_telegram_code) {
          setVerificationCode(profile.current_telegram_code);
        } else {
          // Generate new code
          const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ current_telegram_code: newCode })
            .eq('id', user.id);

          if (updateError) {
            console.error("Failed to save verification code:", updateError);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to generate verification code"
            });
            return;
          }
          
          setVerificationCode(newCode);
        }
      } catch (error) {
        console.error("Error in getOrGenerateCode:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to prepare verification"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getOrGenerateCode();
  }, [user, toast]);

  // Function to verify the connection
  const verifyConnection = useCallback(async () => {
    if (!user || !verificationCode) return;
    
    setIsVerifying(true);
    setAttemptCount(prev => prev + 1);
    
    try {
      // Call the edge function to verify the code
      const { data, error } = await supabase.functions.invoke('verify-telegram-code', {
        body: { 
          code: verificationCode,
          useCustomBot: useCustomBot,
          customBotToken: customBotToken
        }
      });
      
      if (error) {
        console.error("Error verifying code:", error);
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: error.message || "Could not verify your code"
        });
        return;
      }
      
      if (data.duplicateChatId) {
        console.log("Duplicate chat ID detected:", data.duplicateChatId);
        setDuplicateChatId(data.duplicateChatId);
        return;
      }
      
      if (data.verified && data.community) {
        setIsVerified(true);
        setDisplayedCommunity(data.community);
        
        // Refresh queries
        queryClient.invalidateQueries({ queryKey: ['communities'] });
        
        toast({
          title: "Verification Successful",
          description: `Successfully connected to ${data.community.name}`
        });
        
        return;
      }
      
      // If we get here, the verification was not successful
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Could not find your verification code in the channel"
      });
      
    } catch (error) {
      console.error("Error in verifyConnection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during verification"
      });
    } finally {
      setIsVerifying(false);
    }
  }, [user, verificationCode, useCustomBot, customBotToken, toast, queryClient]);

  // Function to refresh community photo
  const handleRefreshPhoto = useCallback(async () => {
    if (!displayedCommunity?.id) return;
    
    setIsRefreshingPhoto(true);
    
    try {
      const { error } = await supabase.functions.invoke('refresh-telegram-photo', {
        body: { 
          communityId: displayedCommunity.id,
          useCustomBot
        }
      });
      
      if (error) {
        console.error("Error refreshing photo:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to refresh photo"
        });
        return;
      }
      
      // Query for the updated community data
      const { data: updatedCommunity, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', displayedCommunity.id)
        .single();
      
      if (communityError) {
        console.error("Error fetching updated community:", communityError);
        return;
      }
      
      setDisplayedCommunity(updatedCommunity);
      
      toast({
        title: "Photo Updated",
        description: "Community photo has been refreshed"
      });
      
    } catch (error) {
      console.error("Error in handleRefreshPhoto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred refreshing the photo"
      });
    } finally {
      setIsRefreshingPhoto(false);
    }
  }, [displayedCommunity, toast, useCustomBot]);

  // Function to reset code and try again
  const handleCodeRetry = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setDuplicateChatId(null);
    
    try {
      // Generate new code
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('profiles')
        .update({ current_telegram_code: newCode })
        .eq('id', user.id);

      if (error) {
        console.error("Failed to save new verification code:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate new verification code"
        });
        return;
      }
      
      setVerificationCode(newCode);
      setAttemptCount(0);
      
      toast({
        title: "New Code Generated",
        description: "Please try verification again with the new code"
      });
    } catch (error) {
      console.error("Error in handleCodeRetry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate new code"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    verificationCode,
    isLoading,
    isVerifying,
    isVerified,
    attemptCount,
    duplicateChatId,
    displayedCommunity,
    isRefreshingPhoto,
    userId,
    useCustomBot,
    customBotToken,
    handleRefreshPhoto,
    verifyConnection,
    handleCodeRetry
  };
};
