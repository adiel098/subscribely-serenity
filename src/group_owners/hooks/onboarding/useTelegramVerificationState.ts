
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";

export const useTelegramVerificationState = () => {
  const { user } = useAuth();
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [useCustomBot, setUseCustomBot] = useState<boolean>(false);
  const [customBotToken, setCustomBotToken] = useState<string | null>(null);
  
  const { verifyConnection, isVerifying, duplicateChatId, resetDuplicateError } = useTelegramVerification();
  const { 
    isLoading: isCommunitiesLoading, 
    communities, 
    refreshCommunities, 
    getCommunityById,
    isRefreshingPhoto,
    handleRefreshPhoto
  } = useTelegramCommunities();
  
  const userId = user?.id;
  const isVerified = communities.length > 0;
  const displayedCommunity = communities.length > 0 ? communities[0] : null;
  const isLoading = verificationCode === null || isCommunitiesLoading;
  
  // Generate verification code on component mount
  useEffect(() => {
    if (!user) return;
    
    const newCode = generateVerificationCode();
    console.log("Generated verification code:", newCode);
    setVerificationCode(newCode);
    
    // Also check if user has chosen to use a custom bot
    const fetchBotPreference = async () => {
      try {
        const { data, error } = await supabase.rpc('get_bot_preference');
        
        if (!error && data) {
          console.log("Bot preference data:", data);
          
          const isCustom = data.use_custom || false;
          setUseCustomBot(isCustom);
          
          // If using a custom bot, get the token (if any)
          if (isCustom && data.custom_bot_token) {
            setCustomBotToken(data.custom_bot_token);
          }
        }
      } catch (err) {
        console.error("Error fetching bot preference:", err);
      }
    };
    
    fetchBotPreference();
  }, [user]);
  
  // Increment attempt count when verification is triggered
  const handleVerifyConnection = useCallback(() => {
    if (!verificationCode) return;
    
    setAttemptCount(prevCount => prevCount + 1);
    verifyConnection(verificationCode);
  }, [verificationCode, verifyConnection]);
  
  // Handle code retry
  const handleCodeRetry = useCallback(() => {
    const newCode = generateVerificationCode();
    console.log("Generated new verification code:", newCode);
    setVerificationCode(newCode);
    setAttemptCount(0);
    resetDuplicateError();
  }, [resetDuplicateError]);
  
  return {
    verificationCode,
    isLoading,
    isVerifying,
    isVerified,
    attemptCount,
    duplicateChatId,
    displayedCommunity,
    isRefreshingPhoto,
    handleRefreshPhoto,
    verifyConnection: handleVerifyConnection,
    handleCodeRetry,
    userId,
    useCustomBot,
    customBotToken
  };
};
