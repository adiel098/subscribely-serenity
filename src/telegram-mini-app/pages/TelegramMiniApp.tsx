
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionForm } from "@/telegram-mini-app/components/EmailCollectionForm";
import { PlanSelectionSection } from "@/telegram-mini-app/components/PlanSelectionSection";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { useUserEmail } from "@/telegram-mini-app/hooks/useUserEmail";
import { Plan } from "@/telegram-mini-app/types/app.types";
import { useToast } from "@/components/ui/use-toast";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  
  const initData = searchParams.get("initData");
  const startParam = searchParams.get("start");
  
  // Log params to debug the issue
  useEffect(() => {
    console.log("TelegramMiniApp initialized with params:", { 
      initData: initData ? `${initData.substring(0, 20)}...` : null, 
      startParam 
    });
  }, [initData, startParam]);
  
  // Use our custom hooks to fetch data and manage state
  const { loading, community, telegramUser, error } = useCommunityData({ startParam, initData });
  
  // Log user data to see if it's being retrieved correctly
  useEffect(() => {
    console.log("Telegram user data:", telegramUser);
    console.log("Community data:", community);
  }, [telegramUser, community]);
  
  const { showEmailForm, isProcessing, processComplete, handleEmailFormComplete } = useUserEmail({ 
    telegramUser, 
    communityId: community?.id 
  });
  
  // Log the email form state
  useEffect(() => {
    console.log("Email form state:", { showEmailForm, isProcessing, processComplete });
  }, [showEmailForm, isProcessing, processComplete]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show loading screen while initial data is being fetched or user is being processed
  if (loading || isProcessing) {
    return <LoadingScreen />;
  }

  // Show error if community not found
  if (error || !community) {
    return <CommunityNotFound errorMessage={error || "Community not found"} />;
  }

  // Show email collection form if needed
  if (showEmailForm && telegramUser && processComplete) {
    console.log("Showing email collection form for user:", telegramUser.id);
    return (
      <EmailCollectionForm 
        telegramUserId={telegramUser.id} 
        onComplete={handleEmailFormComplete} 
      />
    );
  }

  // Only show community page if email form shouldn't be shown or process is complete
  console.log("Showing community page for:", community.name);
  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-8 px-4 space-y-12">
          <CommunityHeader community={community} />

          <PlanSelectionSection 
            plans={community.subscription_plans}
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
          />

          {selectedPlan && (
            <PaymentMethods
              selectedPlan={selectedPlan}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onCompletePurchase={handleCompletePurchase}
              communityInviteLink={community.telegram_invite_link}
              showSuccess={showSuccess}
            />
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default TelegramMiniApp;
