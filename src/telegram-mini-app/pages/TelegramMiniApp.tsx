
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
import { supabase } from "@/integrations/supabase/client";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualEmailCollection, setManualEmailCollection] = useState(false);
  const [manualTelegramUserId, setManualTelegramUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const initData = searchParams.get("initData");
  const startParam = searchParams.get("start");
  
  // Get Telegram user data directly from WebApp object
  useEffect(() => {
    console.log("Attempting to get Telegram WebApp data...");
    
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        console.log("Running inside Telegram WebApp");
        
        // Set up Telegram WebApp
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        console.log("WebApp raw data:", window.Telegram.WebApp.initDataUnsafe);
        
        // Get user from WebApp
        const webAppUser = window.Telegram.WebApp.initDataUnsafe.user;
        if (webAppUser && webAppUser.id) {
          const userId = String(webAppUser.id);
          console.log("Successfully got user ID from WebApp:", userId);
          
          // Check if user exists and has email
          checkUserEmail(userId);
          
          // Store ID for potential manual email collection
          setManualTelegramUserId(userId);
        } else {
          console.log("No user data in WebApp object");
        }
      } catch (error) {
        console.error("Error accessing WebApp data:", error);
      }
    } else {
      console.log("Not running inside Telegram WebApp");
    }
  }, []);
  
  // Check if user has email in database
  const checkUserEmail = async (telegramUserId: string) => {
    try {
      console.log("Checking if user exists:", telegramUserId);
      
      const { data: existingUser, error } = await supabase
        .from('telegram_mini_app_users')
        .select('email')
        .eq('telegram_id', telegramUserId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking user:", error);
        return;
      }
      
      if (!existingUser || !existingUser.email) {
        console.log("User needs to provide email");
        setManualEmailCollection(true);
      } else {
        console.log("User already has email:", existingUser.email);
        setManualEmailCollection(false);
      }
    } catch (error) {
      console.error("Error in checkUserEmail:", error);
    }
  };
  
  // Handle email form completion
  const handleEmailFormComplete = () => {
    setManualEmailCollection(false);
  };
  
  // Use our custom hook to fetch community data
  const { loading, community, telegramUser, error } = useCommunityData({ startParam, initData });
  
  // Use email hook for backward compatibility
  const { 
    showEmailForm: hookShowEmailForm, 
    isProcessing, 
    processComplete,
    handleEmailFormComplete: hookHandleEmailFormComplete
  } = useUserEmail({ 
    telegramUser, 
    communityId: community?.id 
  });
  
  // Combine the direct WebApp approach with the hook approach
  const showEmailForm = manualEmailCollection || (hookShowEmailForm && processComplete);

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
  if (showEmailForm) {
    // Use either the WebApp user ID or the one from the hook
    const emailUserId = manualTelegramUserId || (telegramUser && telegramUser.id);
    
    if (emailUserId) {
      console.log("Showing email collection form for user:", emailUserId);
      return (
        <EmailCollectionForm 
          telegramUserId={emailUserId} 
          onComplete={handleEmailFormComplete} 
        />
      );
    }
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
