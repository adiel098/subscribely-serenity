
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getUserSubscriptions, Subscription } from "../services/memberService";

export const useUserSubscriptions = (telegramUserId: string | undefined) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    if (!telegramUserId) {
      setError("User ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useUserSubscriptions] Fetching subscriptions for user ${telegramUserId}`);
      const data = await getUserSubscriptions(telegramUserId);
      console.log(`[useUserSubscriptions] Received ${data.length} subscriptions`, data);
      setSubscriptions(data);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to fetch your subscriptions");
      toast({
        title: "Error",
        description: "Failed to load your subscriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add renewSubscription function
  const renewSubscription = async (subscription: Subscription) => {
    if (!telegramUserId) {
      toast({
        title: "Error",
        description: "User ID is required to renew subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`[useUserSubscriptions] Renewing subscription for plan:`, subscription.plan);
      
      // The actual renewal process is handled in the parent component
      // This function serves as a logging point and could be expanded 
      // with actual API calls in the future if needed
      
      toast({
        title: "Preparing Renewal",
        description: "Setting up subscription renewal...",
      });
      
      return subscription;
    } catch (err) {
      console.error("Error in renewal preparation:", err);
      toast({
        title: "Error",
        description: "There was a problem preparing your renewal. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (telegramUserId) {
      fetchSubscriptions();
    }
  }, [telegramUserId]);

  return {
    subscriptions,
    isLoading,
    error,
    refetch: fetchSubscriptions,
    renewSubscription
  };
};
