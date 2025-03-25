
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingState } from "./types";
import { 
  fetchOnboardingProfile, 
  fetchCommunities, 
  fetchPlatformSubscription, 
  fetchPaymentMethods 
} from "../../services/onboardingService";
import { toast } from "sonner";

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const [state, setState] = useState<OnboardingState>({
    currentStep: "welcome",
    isCompleted: false,
    isTelegramConnected: false,
    hasPlatformPlan: false,
    hasPaymentMethod: false,
  });

  const fetchOnboardingStatus = useCallback(async () => {
    if (!user) return;
    
    // Prevent multiple fetches
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching onboarding status for user:", user.id);
      
      // Fetch profile data to get onboarding status
      let profile = null;
      try {
        profile = await fetchOnboardingProfile(user.id);
        console.log("Profile data:", profile);
      } catch (profileError) {
        console.error("Error fetching profile:", profileError);
        // Continue with default values if profile cannot be fetched
      }

      // Check if user has connected a Telegram group
      let communities = [];
      try {
        communities = await fetchCommunities(user.id);
        console.log("Communities data:", communities);
      } catch (communitiesError) {
        console.error("Error fetching communities:", communitiesError);
        // Continue with default values if communities cannot be fetched
      }

      // Check if user has a platform subscription
      let subscription = null;
      try {
        subscription = await fetchPlatformSubscription(user.id);
        console.log("Subscription data:", subscription);
      } catch (subscriptionError) {
        console.error("Error fetching subscription:", subscriptionError);
        // Continue with default values if subscription cannot be fetched
      }

      // Check if user has set up payment methods
      let paymentMethods = [];
      try {
        paymentMethods = await fetchPaymentMethods(user.id);
        console.log("Payment methods data:", paymentMethods);
      } catch (paymentMethodsError) {
        console.error("Error fetching payment methods:", paymentMethodsError);
        // Continue with default values if payment methods cannot be fetched
      }

      setState({
        currentStep: (profile?.onboarding_step as any) || "welcome",
        isCompleted: profile?.onboarding_completed || false,
        isTelegramConnected: communities && communities.length > 0 && communities.some(c => c.telegram_chat_id),
        hasPlatformPlan: !!subscription,
        hasPaymentMethod: paymentMethods && paymentMethods.length > 0
      });

      console.log("Onboarding state updated:", {
        currentStep: (profile?.onboarding_step as any) || "welcome",
        isCompleted: profile?.onboarding_completed || false,
        isTelegramConnected: communities && communities.length > 0 && communities.some(c => c.telegram_chat_id),
        hasPlatformPlan: !!subscription,
        hasPaymentMethod: paymentMethods && paymentMethods.length > 0
      });
      
      hasFetchedRef.current = true;
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      toast.error("Failed to load your onboarding status");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchOnboardingStatus();
    }
  }, [user, fetchOnboardingStatus]);

  return {
    state,
    isLoading,
    refreshStatus: fetchOnboardingStatus
  };
};
