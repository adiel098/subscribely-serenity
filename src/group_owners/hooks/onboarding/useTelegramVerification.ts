
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTelegramVerification = (
  userId: string | undefined,
  verificationCode: string | null
) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [duplicateChatId, setDuplicateChatId] = useState<string>('');
  const [lastVerifiedCommunity, setLastVerifiedCommunity] = useState<any>(null);

  const resetDuplicateError = useCallback(() => {
    setDuplicateChatId('');
  }, []);

  const checkVerificationStatus = useCallback(async () => {
    if (!userId) return false;
    
    try {
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('owner_id', userId)
        .not('telegram_chat_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (communityError) throw communityError;
      
      const hasTelegramConnected = communityData && communityData.length > 0;
      setHasTelegram(hasTelegramConnected);
      return hasTelegramConnected;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  }, [userId]);

  const verifyConnection = async () => {
    setIsVerifying(true);
    try {
      const { data: botPreference } = await supabase.rpc('get_bot_preference');
      const isCustomBot = botPreference?.use_custom || false;
      const customBotToken = botPreference?.custom_bot_token;
      
      const botTokenToUse = isCustomBot && customBotToken ? customBotToken : null;
      
      const { data, error } = await supabase.functions.invoke('verify-telegram-code', {
        body: { 
          userId: userId,
          verificationCode: verificationCode,
          customBotToken: botTokenToUse
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        toast.success("Telegram channel connected successfully!");
        setIsVerified(true);
        setLastVerifiedCommunity(data.community || null);
        
        await checkVerificationStatus();
      } else {
        if (data.errorType === 'DUPLICATE_CHAT') {
          setDuplicateChatId(data.chatId || '');
          toast.error("This Telegram channel is already connected to another account");
        } else {
          toast.error(data.message || "Verification failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error verifying Telegram connection:", error);
      toast.error("Failed to verify connection. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    isVerified,
    attemptCount,
    hasTelegram,
    duplicateChatId,
    lastVerifiedCommunity,
    setIsVerified,
    verifyConnection,
    checkVerificationStatus,
    resetDuplicateError
  };
};
