
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useTelegramVerification(userId: string | undefined, verificationCode: string | null) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [duplicateChatId, setDuplicateChatId] = useState<string | null>(null);

  // Reset attempt count when verification code changes
  useEffect(() => {
    setAttemptCount(0);
  }, [verificationCode]);

  // Check verification status
  const checkVerificationStatus = async () => {
    if (!userId || !verificationCode) return false;
    
    try {
      // Call the edge function to check verification status
      const { data, error } = await supabase.functions.invoke('check-verification-status', {
        body: {
          userId: userId,
          verificationCode: verificationCode
        }
      });
      
      if (error) {
        console.error('Error checking verification status:', error);
        return false;
      }
      
      console.log('Verification status response:', data);
      
      if (data?.verified) {
        // Check if any communities were returned from the function
        if (data.communities && data.communities.length > 0) {
          // Get the most recently created community
          const latestCommunity = data.communities[0];
          
          // Check if this chat ID already exists for a different owner
          if (latestCommunity.telegram_chat_id) {
            const { data: existingCommunities, error: duplicateError } = await supabase
              .from('communities')
              .select('id, name, owner_id')
              .eq('telegram_chat_id', latestCommunity.telegram_chat_id)
              .neq('owner_id', userId);
              
            if (duplicateError) {
              console.error('Error checking for duplicate communities:', duplicateError);
            }
            
            if (existingCommunities && existingCommunities.length > 0) {
              // Found a duplicate!
              setDuplicateChatId(latestCommunity.telegram_chat_id);
              return false;
            }
          }
        }
        
        setIsVerified(true);
        setHasTelegram(true);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in verification check:', err);
      return false;
    }
  };

  // Verify the telegram connection
  const verifyConnection = async () => {
    if (!userId || !verificationCode) return;
    
    setIsVerifying(true);
    setAttemptCount(prev => prev + 1);
    setDuplicateChatId(null); // Reset duplicate status
    
    try {
      // Check verification status through dedicated function
      const isVerified = await checkVerificationStatus();
      
      if (isVerified) {
        toast({
          title: 'Success!',
          description: 'Telegram channel connected successfully.',
        });
      } else if (duplicateChatId) {
        // Show error for duplicate channel
        toast({
          title: 'Channel already connected',
          description: 'This Telegram channel is already connected to another account.',
          variant: 'destructive'
        });
      } else {
        // If not verified, and this is not the first attempt, show warning
        if (attemptCount > 0) {
          toast({
            title: 'Verification pending',
            description: 'Make sure you\'ve added the bot as an admin and posted the code in the channel.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Checking verification',
            description: 'Verifying your Telegram channel connection...',
          });
          
          // Try again after delay (webhook might need time to process)
          setTimeout(checkVerificationStatus, 5000);
        }
      }
    } catch (err) {
      console.error('Error during verification:', err);
      toast({
        title: 'Error',
        description: 'Failed to verify connection. Please try again.',
        variant: 'destructive'
      });
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
    setIsVerified,
    verifyConnection,
    checkVerificationStatus
  };
}
