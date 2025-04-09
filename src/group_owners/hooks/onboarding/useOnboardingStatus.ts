
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingStep, OnboardingStatus } from "./types";
import { 
  fetchOnboardingProfile, 
  fetchCommunities, 
  fetchPlatformSubscription, 
  fetchPaymentMethods 
} from "../../services/onboardingService";
import { toast } from "sonner";
import { localStorageService } from "@/utils/localStorageService";

// Define a local interface for the state
interface OnboardingStateData {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const [state, setState] = useState<OnboardingStateData>(() => {
    // Try to get initial state from localStorage
    const savedStatus = localStorageService.getOnboardingStatus();
    const savedHasCommunity = localStorageService.getHasCommunity();
    
    if (savedStatus && savedHasCommunity !== null) {
      return {
        currentStep: savedStatus.lastStep as OnboardingStep || "welcome",
        isCompleted: savedStatus.isCompleted,
        isTelegramConnected: savedHasCommunity,
        hasPlatformPlan: false,
        hasPaymentMethod: false,
      };
    }
    
    return {
      currentStep: "welcome",
      isCompleted: false,
      isTelegramConnected: false,
      hasPlatformPlan: false,
      hasPaymentMethod: false,
    };
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

      const hasCommunity = communities && communities.length > 0 && communities.some(c => c.telegram_chat_id);
      const newState = {
        currentStep: (profile?.onboarding_step as any) || "welcome",
        isCompleted: profile?.onboarding_completed || false,
        isTelegramConnected: hasCommunity,
        hasPlatformPlan: !!subscription,
        hasPaymentMethod: paymentMethods && paymentMethods.length > 0
      };

      // Save to localStorage - using lastStep property to match the interface
      localStorageService.setOnboardingStatus({
        lastStep: newState.currentStep,
        isCompleted: newState.isCompleted
      });
      localStorageService.setHasCommunity(hasCommunity);

      setState(newState);

      console.log("Onboarding state updated:", newState);
      
      hasFetchedRef.current = true;
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      toast.error("Failed to load your onboarding status");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Clear localStorage when user logs out
  useEffect(() => {
    if (!user) {
      localStorageService.clearAllData();
    }
  }, [user]);

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchOnboardingStatus();
    }
  }, [user, fetchOnboardingStatus]);

  const refreshStatus = useCallback(() => {
    hasFetchedRef.current = false;
    return fetchOnboardingStatus();
  }, [fetchOnboardingStatus]);

  return {
    state,
    isLoading,
    refreshStatus
  };
};
