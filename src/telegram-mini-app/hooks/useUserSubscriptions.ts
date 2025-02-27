
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
      const data = await getUserSubscriptions(telegramUserId);
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
  };
};
