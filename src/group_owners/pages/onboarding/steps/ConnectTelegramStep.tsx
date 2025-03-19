
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/card";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { SendIcon, ArrowRight, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { OnboardingStep } from "@/group_owners/hooks/useOnboarding";

interface ConnectTelegramStepProps {
  goToNextStep: () => void;
  isTelegramConnected: boolean;
  saveCurrentStep: (step: OnboardingStep) => Promise<void>;
}

export const ConnectTelegramStep: React.FC<ConnectTelegramStepProps> = ({ 
  goToNextStep, 
  isTelegramConnected,
  saveCurrentStep
}) => {
  const { data: communities, isLoading, refetch } = useCommunities();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check if the user has connected their Telegram account
  useEffect(() => {
    if (isTelegramConnected || (communities && communities.length > 0)) {
      setIsConnecting(false);
    }
  }, [isTelegramConnected, communities]);
  
  const handleConnectTelegram = () => {
    setIsConnecting(true);
    saveCurrentStep('connect-telegram');
    window.location.href = "/connect/telegram";
  };
  
  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Your Telegram Group"
      description="Link your Telegram community to Membify"
      icon={<MessageCircle className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : communities && communities.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 text-green-700">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <SendIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Telegram Group Connected!</h3>
                <p>Your community "{communities[0].name}" is successfully linked to Membify</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-100 rounded-lg p-5"
          >
            <h3 className="font-semibold text-lg mb-3 text-blue-800">How to connect your Telegram group:</h3>
            <ol className="space-y-4 text-blue-700">
              <li className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</div>
                <div>
                  <span className="font-medium">Add our bot to your group</span>
                  <p className="text-sm mt-1">Invite @MembifyBot to your Telegram group and make it an admin</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5">2</div>
                <div>
                  <span className="font-medium">Click "Connect Telegram"</span>
                  <p className="text-sm mt-1">You'll be redirected to our bot to link your account</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5">3</div>
                <div>
                  <span className="font-medium">Verify your group</span>
                  <p className="text-sm mt-1">Follow the instructions to verify and connect your group</p>
                </div>
              </li>
            </ol>
          </motion.div>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {isTelegramConnected || (communities && communities.length > 0) ? (
            <Button 
              onClick={goToNextStep}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleConnectTelegram}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Telegram <SendIcon className="h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
};
