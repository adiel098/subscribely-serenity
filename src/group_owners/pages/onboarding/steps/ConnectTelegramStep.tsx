
import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { ConnectedChannelDisplay } from "@/group_owners/components/onboarding/telegram/ConnectedChannelDisplay";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { TelegramVerificationError } from "@/group_owners/components/onboarding/telegram/TelegramVerificationError";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
  
  // If there is a lastVerifiedCommunity but no lastConnectedCommunity, use the verified one
  const displayedCommunity = lastConnectedCommunity || lastVerifiedCommunity;

  // Go to dashboard and complete onboarding
  const handleGoToDashboard = () => {
    onComplete();
    navigate('/dashboard', { replace: true });
  };

  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Your Telegram Channel"
      description="Link your Telegram channel or group to enable subscription management"
      icon={<MessageCircle className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="w-full max-w-4xl mx-auto">
        {isVerified && displayedCommunity ? (
          // Show the successfully connected channel with go to dashboard button
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full">
              <ConnectedChannelDisplay 
                community={displayedCommunity}
                onContinue={handleGoToDashboard}
                onRefreshPhoto={handleRefreshPhoto}
                isRefreshingPhoto={isRefreshingPhoto}
              />
            </div>
            
            <Button 
              onClick={handleGoToDashboard}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mt-4"
              size="lg"
            >
              Go to Dashboard
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
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
          // Show the verification steps
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
      </div>
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
