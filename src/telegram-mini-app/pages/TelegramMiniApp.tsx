
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
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { Plan } from "@/telegram-mini-app/types/app.types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { useEmailVerification } from "@/telegram-mini-app/hooks/useEmailVerification";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  
  const initData = searchParams.get("initData");
  const startParam = searchParams.get("start");
  
  // Use our new hook to get Telegram user data
  const { 
    loading: userLoading, 
    telegramUser, 
    error: userError 
  } = useTelegramUser({ 
    initData, 
    startParam 
  });
  
  // Use our custom hook to fetch community data
  const { 
    loading: communityLoading, 
    community, 
    error: communityError 
  } = useCommunityData({ 
    startParam, 
    initData 
  });
  
  // Use email hook for handling email collection
  const { 
    showEmailForm, 
    isProcessing, 
    processComplete,
    handleEmailFormComplete
  } = useUserEmail({ 
    telegramUser, 
    communityId: community?.id 
  });
  
  // Use our extracted hook for email verification
  const { 
    manualEmailCollection, 
    setManualEmailCollection 
  } = useEmailVerification({
    telegramUser,
    toast
  });

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
  if (userLoading || communityLoading || isProcessing) {
    return <LoadingScreen />;
  }

  // Show error if community not found or user data error
  if (communityError || !community) {
    return <CommunityNotFound errorMessage={communityError || "Community not found"} />;
  }
  
  if (userError) {
    return <CommunityNotFound errorMessage={`Error loading user data: ${userError}`} />;
  }

  // Show email collection form if needed
  if (manualEmailCollection || (showEmailForm && processComplete)) {
    if (telegramUser?.id) {
      console.log("Showing email collection form for user:", telegramUser.id);
      return (
        <EmailCollectionForm 
          telegramUserId={telegramUser.id} 
          onComplete={handleEmailFormComplete} 
        />
      );
    }
  }

  // Only show community page if email form shouldn't be shown or process is complete
  console.log("Showing community page for:", community.name);
  return (
    <ScrollArea className="h-[100vh] w-full">
      <MainContent
        community={community}
        selectedPlan={selectedPlan}
        onPlanSelect={handlePlanSelect}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        onCompletePurchase={handleCompletePurchase}
        showSuccess={showSuccess}
      />
    </ScrollArea>
  );
};

export default TelegramMiniApp;
