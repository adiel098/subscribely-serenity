
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingState } from "./types";
import { 
  fetchOnboardingProfile, 
  fetchCommunities, 
  fetchPlatformSubscription, 
  fetchPaymentMethods 
} from "../../services/onboardingService";

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const [state, setState] = useState<OnboardingState>({
    currentStep: "welcome",
    isCompleted: false,
    isTelegramConnected: false,
    hasPlatformPlan: false,
    hasPaymentMethod: false,
  });

  const fetchOnboardingStatus = async () => {
    if (!user) return;
    
    // Prevent multiple fetches
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching onboarding status for user:", user.id);
      
      // Fetch profile data to get onboarding status
      const profile = await fetchOnboardingProfile(user.id);
      console.log("Profile data:", profile);

      // Check if user has connected a Telegram group
      const communities = await fetchCommunities(user.id);
      console.log("Communities data:", communities);

      // Check if user has a platform subscription
      const subscription = await fetchPlatformSubscription(user.id);
      console.log("Subscription data:", subscription);

      // Check if user has set up payment methods
      const paymentMethods = await fetchPaymentMethods(user.id);
      console.log("Payment methods data:", paymentMethods);

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your onboarding status"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchOnboardingStatus();
    }
  }, [user]);

  return {
    state,
    isLoading,
    refreshStatus: fetchOnboardingStatus
  };
};
