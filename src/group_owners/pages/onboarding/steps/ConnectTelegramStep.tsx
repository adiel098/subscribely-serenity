
import { useState, useEffect } from 'react';
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { ConnectedChannelDisplay } from "@/group_owners/components/onboarding/telegram/ConnectedChannelDisplay";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { TelegramVerificationError } from "@/group_owners/components/onboarding/telegram/TelegramVerificationError";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";

const ConnectTelegramStep = ({ 
  onComplete, 
  activeStep, 
  goToPreviousStep 
}: { 
  onComplete: () => void, 
  activeStep: boolean,
  goToPreviousStep: () => void
}) => {
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
  
  // Function to continue to next step
  const handleContinueToNextStep = () => {
    onComplete();
  };
  
  // Refresh communities when lastVerifiedCommunity changes
  useEffect(() => {
    if (lastVerifiedCommunity) {
      console.log('Detected new verified community, refreshing community list');
      fetchConnectedCommunities();
    }
  }, [lastVerifiedCommunity]);
  
  // If there is a lastVerifiedCommunity but no lastConnectedCommunity, use the verified one
  const displayedCommunity = lastConnectedCommunity || lastVerifiedCommunity;
  
  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Your Telegram Channel"
      description="Link your Telegram channel or group to enable subscription management"
      icon={<MessageCircle className="w-6 h-6" />}
      showBackButton={false}
    >
      {isVerified && displayedCommunity ? (
        // Show the successfully connected channel with continue button
        <ConnectedChannelDisplay 
          community={displayedCommunity}
          onContinue={handleContinueToNextStep}
          onRefreshPhoto={handleRefreshPhoto}
          isRefreshingPhoto={isRefreshingPhoto}
        />
      ) : duplicateChatId ? (
        // Show duplicate error message
        <TelegramVerificationError 
          title="Duplicate Telegram Channel Detected"
          description="This Telegram channel is already connected to another account."
          troubleshootingSteps={[
            "Use a different Telegram channel or group.",
            "If you believe this is an error, please contact support."
          ]}
          onBack={() => {
            // Reset the verification state and try again
            if (user) {
              fetchOrGenerateVerificationCode(user.id, toast)
                .then(code => setVerificationCode(code));
            }
          }}
          showError={true}
        />
      ) : (
        // Show the verification form
        <TelegramVerificationForm
          verificationCode={verificationCode}
          isLoading={isLoading}
          isVerifying={isVerifying}
          attemptCount={attemptCount}
          onVerify={verifyConnection}
          onBack={goToPreviousStep}
          showBackButton={true}
        />
      )}
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
