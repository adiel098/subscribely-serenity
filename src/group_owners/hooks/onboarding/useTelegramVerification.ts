
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
  const [lastVerifiedCommunity, setLastVerifiedCommunity] = useState<any>(null);

  // Reset attempt count when verification code changes
  useEffect(() => {
    setAttemptCount(0);
  }, [verificationCode]);

  // Reset duplicate error
  const resetDuplicateError = () => {
    setDuplicateChatId(null);
  };

  // Check verification status
  const checkVerificationStatus = async () => {
    if (!userId || !verificationCode) return false;
    
    try {
      console.log('Checking verification status for user:', userId, 'with code:', verificationCode);
      
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
          setLastVerifiedCommunity(latestCommunity);
          
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
      console.log('Attempting to verify connection with code:', verificationCode);
      
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
        // Try to check existing communities for this user that might have been created
        // This handles cases where the webhook processed successfully but frontend didn't catch it
        const { data: recentCommunities, error: commError } = await supabase
          .from('communities')
          .select('id, name, telegram_chat_id, created_at, telegram_photo_url')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (commError) {
          console.error('Error fetching recent communities:', commError);
        } else if (recentCommunities && recentCommunities.length > 0) {
          // Check if any recent community was created in last 60 seconds
          const now = new Date();
          const recentTime = new Date(now.getTime() - 60 * 1000); // 60 seconds ago
          
          const veryRecentCommunity = recentCommunities.find(comm => {
            const commCreated = new Date(comm.created_at);
            return commCreated > recentTime;
          });
          
          if (veryRecentCommunity) {
            console.log('Found recently created community:', veryRecentCommunity);
            setLastVerifiedCommunity(veryRecentCommunity);
            setIsVerified(true);
            setHasTelegram(true);
            
            toast({
              title: 'Success!',
              description: 'Telegram channel connected successfully.',
            });
            
            return;
          }
        }
        
        // Show verification pending message on every attempt, not just after first attempt
        toast({
          title: 'Verification pending',
          description: 'Make sure you\'ve added the bot as an admin and posted the code in the channel.',
          variant: 'destructive'
        });
        
        // On first attempt, also try again after delay (webhook might need time to process)
        if (attemptCount === 0) {
          toast({
            title: 'Checking verification',
            description: 'Verifying your Telegram channel connection...',
          });
          
          // Try again after delay (webhook might need time to process)
          setTimeout(async () => {
            const isVerified = await checkVerificationStatus();
            if (isVerified) {
              toast({
                title: 'Success!',
                description: 'Telegram channel connected successfully.',
              });
            } else {
              // Show failure message if automatic verification fails
              toast({
                title: 'Verification failed',
                description: 'Please make sure the bot is an admin and the code is posted correctly.',
                variant: 'destructive'
              });
            }
          }, 5000);
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
    lastVerifiedCommunity,
    setIsVerified,
    verifyConnection,
    checkVerificationStatus,
    resetDuplicateError
  };
}
