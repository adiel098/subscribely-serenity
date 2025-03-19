
import { useState, useEffect } from 'react';
import { MessageCircle, Copy, CheckCircle, PartyPopper, Bot, ShieldCheck, ArrowRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { ConnectedChannelDisplay } from "@/group_owners/components/onboarding/telegram/ConnectedChannelDisplay";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { TelegramVerificationError } from "@/group_owners/components/onboarding/telegram/TelegramVerificationError";
import { useTelegramVerification } from "@/group_owners/hooks/onboarding/useTelegramVerification";
import { useTelegramCommunities } from "@/group_owners/hooks/onboarding/useTelegramCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  
  const copyToClipboard = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copied Successfully!",
        description: "Verification code copied to clipboard",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Your Telegram Channel"
      description="Link your Telegram channel or group to enable subscription management"
      icon={<MessageCircle className="w-6 h-6" />}
      showBackButton={showBackButton => true}
      onBack={goToPreviousStep}
    >
      <div className="w-full max-w-4xl mx-auto">
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
          // Show the verification steps
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl overflow-hidden">
                <div className="space-y-10">
                  {/* Step 1 */}
                  <motion.div 
                    className="flex flex-col md:flex-row gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="flex-shrink-0 flex items-start">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-indigo-600" />
                        Add our bot to your group
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Add <a 
                          href="https://t.me/membifybot" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-medium hover:text-indigo-800 underline decoration-2 decoration-indigo-300 underline-offset-2"
                        >
                          @MembifyBot
                        </a> to your Telegram group or channel and make it an administrator with these permissions:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-center text-gray-700">
                          <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Delete messages</span>
                        </li>
                        <li className="flex items-center text-gray-700">
                          <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Ban users</span>
                        </li>
                        <li className="flex items-center text-gray-700">
                          <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Add new admins</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div 
                    className="flex flex-col md:flex-row gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex-shrink-0 flex items-start">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Copy className="h-5 w-5 text-indigo-600" />
                        Copy Verification Code
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Copy this verification code and paste it in your Telegram group or channel
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                        <code className="px-6 py-3 bg-indigo-50 rounded-lg text-lg font-mono border border-indigo-100 text-indigo-700 w-full sm:w-auto text-center">
                          {verificationCode || "Loading..."}
                        </code>
                        <Button
                          onClick={() => copyToClipboard(verificationCode || "")}
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md w-full sm:w-auto"
                          disabled={!verificationCode || isLoading}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </Button>
                      </div>
                      <p className="mt-3 text-sm text-gray-500 flex items-center">
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Note</span>
                        The message will be automatically deleted once verified
                      </p>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div 
                    className="flex flex-col md:flex-row gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="flex-shrink-0 flex items-start">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Send className="h-5 w-5 text-indigo-600" />
                        Verify Connection
                      </h3>
                      <p className="mt-2 text-gray-600">
                        After adding the bot and sending the verification code, click below to verify the connection
                      </p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                        onClick={verifyConnection}
                        disabled={isVerifying || !verificationCode || isLoading}
                      >
                        {isVerifying ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Verify Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Show troubleshooting section if there were previous attempts */}
                {attemptCount > 1 && (
                  <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tip</span> 
                      Verification not working?
                    </h4>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-start gap-2">
                        <span className="block min-w-4">•</span>
                        <span>Make sure you've added @MembifyBot as an admin to your channel or group</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="block min-w-4">•</span>
                        <span>Ensure the bot has permission to post messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="block min-w-4">•</span>
                        <span>Try posting the verification code as a new message (don't edit an existing message)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
