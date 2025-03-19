
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useTelegramVerificationState } from "@/group_owners/hooks/onboarding/useTelegramVerificationState";
import { VerificationSuccess } from "@/group_owners/components/onboarding/telegram/states/VerificationSuccess";
import { DuplicateChannelError } from "@/group_owners/components/onboarding/telegram/states/DuplicateChannelError";
import { VerificationInProgress } from "@/group_owners/components/onboarding/telegram/states/VerificationInProgress";

const ConnectTelegramStep = ({ 
  onComplete, 
  activeStep, 
  goToPreviousStep 
}: { 
  onComplete: () => void, 
  activeStep: boolean,
  goToPreviousStep: () => void
}) => {
  const navigate = useNavigate();
  
  const {
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
    userId
  } = useTelegramVerificationState();

  // Go to dashboard and complete onboarding
  const handleGoToDashboard = () => {
    console.log("Navigating to dashboard and completing onboarding");
    // Mark onboarding as complete
    onComplete();
    // Navigate to dashboard
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
          <VerificationSuccess 
            community={displayedCommunity}
            handleGoToDashboard={handleGoToDashboard}
            handleRefreshPhoto={handleRefreshPhoto}
            isRefreshingPhoto={isRefreshingPhoto}
          />
        ) : duplicateChatId ? (
          // Show duplicate error message
          <DuplicateChannelError 
            userId={userId || ""}
            onRetry={handleCodeRetry}
          />
        ) : (
          // Show the verification steps
          <VerificationInProgress
            verificationCode={verificationCode}
            isLoading={isLoading}
            isVerifying={isVerifying}
            attemptCount={attemptCount}
            verifyConnection={verifyConnection}
            goToPreviousStep={goToPreviousStep}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
