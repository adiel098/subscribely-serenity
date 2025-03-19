
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";

export const useTelegramVerificationState = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our hooks
  const {
    isVerifying,
    isVerified,
    attemptCount,
    duplicateChatId,
    lastVerifiedCommunity,
    verifyConnection,
    checkVerificationStatus
  } = useTelegramVerification(user?.id, verificationCode);

  const {
    lastConnectedCommunity,
    isRefreshingPhoto,
    fetchConnectedCommunities,
    handleRefreshPhoto
  } = useTelegramCommunities(user?.id);
  
  // Initialize verification code and check existing communities
  useEffect(() => {
    if (!user) return;
    
    const initialize = async () => {
      setIsLoading(true);
      
      // Get or generate verification code
      const code = await fetchOrGenerateVerificationCode(user.id, toast);
      setVerificationCode(code);
      
      // Fetch existing communities
      await fetchConnectedCommunities();
      
      // Check if already verified
      await checkVerificationStatus();
      
      setIsLoading(false);
    };
    
    initialize();
  }, [user]);
  
  // Refresh communities when lastVerifiedCommunity changes
  useEffect(() => {
    if (lastVerifiedCommunity) {
      console.log('Detected new verified community, refreshing community list');
      fetchConnectedCommunities();
    }
  }, [lastVerifiedCommunity]);

  // Function to handle code retry
  const handleCodeRetry = (newCode: string) => {
    setVerificationCode(newCode);
  };
  
  // If there is a lastVerifiedCommunity but no lastConnectedCommunity, use the verified one
  const displayedCommunity = lastConnectedCommunity || lastVerifiedCommunity;

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
    verifyConnection,
    handleCodeRetry,
    userId: user?.id
  };
};
