
import { useState, useEffect, useRef } from "react";
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
  const [webAppReady, setWebAppReady] = useState(false);
  const telegramInitialized = useRef(false);
  const { toast } = useToast();
  
  const initData = searchParams.get("initData");
  const startParam = searchParams.get("start");
  
  // Check if Telegram WebApp script has loaded
  useEffect(() => {
    // Create a script loading detector if the WebApp isn't already available
    if (!window.Telegram?.WebApp) {
      console.log("Telegram WebApp script not found, checking if it's loading...");
      
      const checkWebAppLoaded = () => {
        if (window.Telegram?.WebApp) {
          console.log("Telegram WebApp script loaded!");
          setWebAppReady(true);
          clearInterval(checkInterval);
        }
      };
      
      // Check immediately and then periodically
      checkWebAppLoaded();
      const checkInterval = setInterval(checkWebAppLoaded, 100);
      
      // Clean up interval on unmount
      return () => clearInterval(checkInterval);
    } else {
      console.log("Telegram WebApp already available");
      setWebAppReady(true);
    }
  }, []);
  
  // Extract Telegram WebApp data once it's ready
  useEffect(() => {
    if (!webAppReady) return;
    
    const extractTelegramData = () => {
      console.log("WebApp ready, attempting to extract Telegram data...");
      
      // Only run this once
      if (telegramInitialized.current) return;
      telegramInitialized.current = true;
      
      try {
        // Initialize WebApp
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        console.log("WebApp info:", {
          version: window.Telegram.WebApp.version,
          platform: window.Telegram.WebApp.platform,
          colorScheme: window.Telegram.WebApp.colorScheme,
          isExpanded: window.Telegram.WebApp.isExpanded
        });
        
        // Access WebApp data with a short delay to ensure it's fully initialized
        setTimeout(() => {
          try {
            const webAppData = window.Telegram.WebApp.initDataUnsafe;
            console.log("WebApp data available:", !!webAppData);
            console.log("Full WebApp data:", JSON.stringify(webAppData, null, 2));
            
            if (webAppData && webAppData.user) {
              const user = webAppData.user;
              console.log("Successfully got user from WebApp:", user);
              
              if (user.id) {
                const userId = String(user.id);
                console.log("Successfully extracted user ID:", userId);
                
                // Check if user exists and has email
                checkUserEmail(userId);
                
                // Store ID for potential manual email collection
                setManualTelegramUserId(userId);
              } else {
                console.warn("User object doesn't contain ID:", user);
                fallbackToParams();
              }
            } else {
              console.warn("No user data in WebApp object");
              fallbackToParams();
            }
          } catch (error) {
            console.error("Error accessing WebApp data after delay:", error);
            fallbackToParams();
          }
        }, 500); // Increased delay to ensure WebApp is fully initialized
      } catch (error) {
        console.error("Error in extractTelegramData:", error);
        fallbackToParams();
      }
    };
    
    // Fallback to use URL parameters or development defaults
    const fallbackToParams = () => {
      console.log("Falling back to URL parameters for Telegram data");
      
      // First try to use initData parameter if provided
      if (initData && initData.length > 0) {
        try {
          console.log("Trying to parse initData from URL:", initData);
          const parsedData = JSON.parse(initData);
          if (parsedData && parsedData.user && parsedData.user.id) {
            console.log("Using user data from initData:", parsedData.user);
            checkUserEmail(String(parsedData.user.id));
            setManualTelegramUserId(String(parsedData.user.id));
            return;
          }
        } catch (e) {
          console.error("Failed to parse initData:", e);
        }
      }
      
      // For development/fallback, use a test ID when in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Using test ID for development");
        const testId = "123456789";
        checkUserEmail(testId);
        setManualTelegramUserId(testId);
      } else {
        console.error("Could not retrieve Telegram user ID from any source");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to retrieve user information. Please try again later.",
        });
      }
    };
    
    // Execute the data extraction
    extractTelegramData();
  }, [webAppReady, initData, toast]);
  
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify user data. Please try again.",
        });
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check user data. Please try again.",
      });
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
