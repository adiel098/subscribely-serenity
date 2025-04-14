
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getUserSubscriptions, Subscription } from "../services/memberService";
import { createLogger } from "../utils/debugUtils";
import { supabase } from "@/integrations/supabase/client";

const logger = createLogger("useUserSubscriptions");

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
      logger.log(`Fetching subscriptions for user ${telegramUserId}`);
      const data = await getUserSubscriptions(telegramUserId);
      logger.log(`Received ${data.length} subscriptions`, data);

      // Process each subscription to ensure invite links are available
      const processedSubscriptions = await Promise.all(data.map(async (sub) => {
        // Log community details for debugging
        if (sub.community) {
          logger.log(`Subscription ${sub.id} community:`, {
            id: sub.community.id,
            name: sub.community.name,
            inviteLink: sub.community.telegram_invite_link
          });
        } else {
          logger.warn(`Subscription ${sub.id} has no community data`);
        }
        
        // If no invite link is available on the community, try to fetch it from subscription_payments
        if ((!sub.community?.telegram_invite_link && !sub.invite_link) && sub.community_id) {
          logger.log(`No invite link found for subscription ${sub.id}, checking project_payments`);
          
          // Query subscription_payments for the latest invite link
          const { data: payments, error: paymentsError } = await supabase
            .from('project_payments')
            .select('invite_link, created_at')
            .eq('project_id', sub.community_id)
            .eq('telegram_user_id', telegramUserId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (paymentsError) {
            logger.error(`Error fetching payment with invite link: ${paymentsError.message}`);
          } else if (payments && payments.length > 0 && payments[0].invite_link) {
            logger.log(`Found invite link in payment record: ${payments[0].invite_link}`);
            sub.invite_link = payments[0].invite_link;
          }
        }
        
        return sub;
      }));
      
      setSubscriptions(processedSubscriptions);
    } catch (err) {
      logger.error("Error fetching subscriptions:", err);
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
      logger.log(`Renewing subscription for plan:`, subscription.plan);
      
      // The actual renewal process is handled in the parent component
      // This function serves as a logging point and could be expanded 
      // with actual API calls in the future if needed
      
      toast({
        title: "Preparing Renewal",
        description: "Setting up subscription renewal...",
      });
      
      return subscription;
    } catch (err) {
      logger.error("Error in renewal preparation:", err);
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
