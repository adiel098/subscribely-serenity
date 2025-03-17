
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useCommunityContext } from "@/contexts/CommunityContext";

const logger = createLogger("useSubscribers");

export interface Subscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  community_id: string;
  joined_at: string;
  last_active: string | null;
  subscription_status: string;
  is_active: boolean;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  first_name: string | null;
  last_name: string | null;
  plan?: {
    id: string;
    name: string;
    price: number;
    interval: string;
  } | null;
  // Extended properties for dashboard
  is_trial?: boolean;
  trial_end_date?: string | null;
  payment_status?: string;
  metadata?: {
    mini_app_accessed?: boolean;
    [key: string]: any;
  };
}

export const useSubscribers = (communityId: string) => {
  const { isGroupSelected } = useCommunityContext();
  
  const fetchSubscribers = async (): Promise<Subscriber[]> => {
    if (!communityId) return [];

    logger.log(`Fetching subscribers for ${isGroupSelected ? 'group' : 'community'} ID: ${communityId}`);

    // Fetch subscribers directly from the database with plan information
    // The query is the same for both communities and groups, as we're directly querying by community_id
    const { data: subscribers, error: subscribersError } = await supabase
      .from("community_subscribers")
      .select(`
        *,
        plan:subscription_plan_id (
          id,
          name,
          price,
          interval
        )
      `)
      .eq("community_id", communityId);

    if (subscribersError) {
      logger.error("Error fetching subscribers:", subscribersError);
      return [];
    }

    // Create a map to store user details
    const userDetails: Record<string, { first_name: string | null, last_name: string | null }> = {};
    
    // Fetch user details from telegram_mini_app_users for all telegram_user_ids
    if (subscribers.length > 0) {
      const telegramIds = subscribers.map(subscriber => subscriber.telegram_user_id);
      
      const { data: users, error: usersError } = await supabase
        .from("telegram_mini_app_users")
        .select(`
          telegram_id,
          first_name,
          last_name
        `)
        .in("telegram_id", telegramIds);
        
      if (usersError) {
        logger.error("Error fetching user details:", usersError);
      } else if (users) {
        // Create a map of user details by telegram_id
        users.forEach(user => {
          userDetails[user.telegram_id] = {
            first_name: user.first_name,
            last_name: user.last_name
          };
        });
      }
    }

    // Get payment status from subscription_payments table
    const paymentStatusMap: Record<string, string> = {};
    
    if (subscribers.length > 0) {
      const telegramUserIds = subscribers.map(subscriber => subscriber.telegram_user_id);
      
      // Get the latest payment status for each user
      const { data: payments, error: paymentsError } = await supabase
        .from("subscription_payments")
        .select(`
          telegram_user_id,
          status
        `)
        .eq("community_id", communityId)
        .in("telegram_user_id", telegramUserIds)
        .order("created_at", { ascending: false });
        
      if (paymentsError) {
        logger.error("Error fetching payment status:", paymentsError);
      } else if (payments) {
        // Only keep the most recent payment status for each user
        const processedUserIds = new Set<string>();
        
        payments.forEach(payment => {
          if (!processedUserIds.has(payment.telegram_user_id)) {
            paymentStatusMap[payment.telegram_user_id] = payment.status;
            processedUserIds.add(payment.telegram_user_id);
          }
        });
      }
    }

    // Map the subscribers with their additional details
    return subscribers.map(subscriber => ({
      ...subscriber,
      first_name: userDetails[subscriber.telegram_user_id]?.first_name || null,
      last_name: userDetails[subscriber.telegram_user_id]?.last_name || null,
      payment_status: paymentStatusMap[subscriber.telegram_user_id] || null
    }));
  };

  return useQuery({
    queryKey: ["subscribers", communityId, isGroupSelected ? "group" : "community"],
    queryFn: fetchSubscribers,
    enabled: !!communityId,
  });
};
