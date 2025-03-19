
import { useState, useEffect } from 'react';
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { ConnectedChannelDisplay } from "@/group_owners/components/onboarding/telegram/ConnectedChannelDisplay";
import { ConnectedCommunitiesList } from "@/group_owners/components/onboarding/telegram/ConnectedCommunitiesList";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";

const ConnectTelegramStep = ({ onComplete, activeStep }: { onComplete: () => void, activeStep: boolean }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our new hooks
  const {
    isVerifying,
    isVerified,
    attemptCount,
    hasTelegram,
    setIsVerified,
    verifyConnection,
    checkVerificationStatus
  } = useTelegramVerification(user?.id, verificationCode);

  const {
    connectedCommunities,
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
  
  const resetToAddAnother = () => {
    setIsVerified(false);
  };
  
  // If already verified, move to next step
  useEffect(() => {
    // Only auto-move if there's no telegram connection yet
    if (isVerified && activeStep && !lastConnectedCommunity) {
      onComplete();
    }
  }, [isVerified, activeStep, lastConnectedCommunity]);
  
  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Your Telegram Channel"
      description="Link your Telegram channel or group to enable subscription management"
      icon={<MessageCircle className="w-6 h-6" />}
    >
      {isVerified && lastConnectedCommunity ? (
        <>
          <ConnectedChannelDisplay 
            community={lastConnectedCommunity}
            onAddAnotherGroup={resetToAddAnother}
            onContinue={onComplete}
            onRefreshPhoto={handleRefreshPhoto}
            isRefreshingPhoto={isRefreshingPhoto}
          />
          
          {connectedCommunities.length > 1 && (
            <ConnectedCommunitiesList 
              communities={connectedCommunities.slice(1)} // Skip the first one (last connected)
              onRefreshPhoto={handleRefreshPhoto}
              isRefreshingPhoto={isRefreshingPhoto}
            />
          )}
        </>
      ) : (
        <TelegramVerificationForm
          verificationCode={verificationCode}
          isLoading={isLoading}
          isVerifying={isVerifying}
          attemptCount={attemptCount}
          onVerify={verifyConnection}
        />
      )}
      
      {/* Display existing communities if there are any */}
      {!isVerified && connectedCommunities.length > 0 && (
        <ConnectedCommunitiesList 
          communities={connectedCommunities}
          onRefreshPhoto={handleRefreshPhoto}
          isRefreshingPhoto={isRefreshingPhoto}
        />
      )}
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
