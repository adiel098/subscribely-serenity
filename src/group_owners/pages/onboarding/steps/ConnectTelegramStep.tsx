
import { useState, useEffect } from 'react';
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { ConnectedChannelDisplay } from "@/group_owners/components/onboarding/telegram/ConnectedChannelDisplay";
import { ConnectedCommunitiesList } from "@/group_owners/components/onboarding/telegram/ConnectedCommunitiesList";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { TelegramVerificationError } from "@/group_owners/components/onboarding/telegram/TelegramVerificationError";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
  const [isAddingAnotherGroup, setIsAddingAnotherGroup] = useState(false);
  
  // Use our hooks
  const {
    isVerifying,
    isVerified,
    attemptCount,
    hasTelegram,
    duplicateChatId,
    lastVerifiedCommunity,
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
  
  // Function to handle adding another group
  const handleAddAnotherGroup = () => {
    setIsVerified(false);
    setIsAddingAnotherGroup(true);
    // Reset verification code to get a fresh one
    if (user) {
      fetchOrGenerateVerificationCode(user.id, toast)
        .then(code => setVerificationCode(code));
    }
  };
  
  // Function to continue to next step
  const handleContinueToNextStep = () => {
    onComplete();
  };
  
  // Automatically switch to "add another group" mode when verification succeeds
  useEffect(() => {
    if (isVerified && (lastConnectedCommunity || lastVerifiedCommunity) && isAddingAnotherGroup) {
      // Refresh the list of communities after adding a new one
      fetchConnectedCommunities();
      // Reset the verification process to allow adding more communities
      setIsVerified(false);
      setIsAddingAnotherGroup(false);
    }
  }, [isVerified, lastConnectedCommunity, lastVerifiedCommunity]);
  
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
        // Show the successfully connected channel with options to add more or continue
        <>
          <ConnectedChannelDisplay 
            community={displayedCommunity}
            onAddAnotherGroup={handleAddAnotherGroup}
            onContinue={handleContinueToNextStep}
            onRefreshPhoto={handleRefreshPhoto}
            isRefreshingPhoto={isRefreshingPhoto}
          />
        </>
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
            setIsVerified(false);
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
      
      {/* Always display connected communities if there are any */}
      {connectedCommunities.length > 0 && (
        <ConnectedCommunitiesList 
          communities={isVerified && displayedCommunity ? connectedCommunities.slice(1) : connectedCommunities}
          onRefreshPhoto={handleRefreshPhoto}
          isRefreshingPhoto={isRefreshingPhoto}
          showAddMoreButton={!isVerified && connectedCommunities.length > 0}
          onAddMoreClick={handleContinueToNextStep}
        />
      )}
      
      {/* Show a continue button if we have communities but are in verification mode */}
      {!isVerified && connectedCommunities.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 flex justify-end"
        >
          <Button
            onClick={handleContinueToNextStep}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
          >
            Continue to Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
