import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSubscriber } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupSubscribers");

export const useGroupSubscribers = (groupId: string | null) => {
  return useQuery({
    queryKey: ["group-subscribers", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      logger.log("Fetching subscribers for group ID:", groupId);
      
      try {
        // Fetch subscribers directly from the database with plan information
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
          .eq("community_id", groupId);

        if (subscribersError) {
          logger.error("Error fetching group subscribers:", subscribersError);
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
            logger.error("Error fetching user details for group:", usersError);
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
            .eq("community_id", groupId)
            .in("telegram_user_id", telegramUserIds)
            .order("created_at", { ascending: false });
            
          if (paymentsError) {
            logger.error("Error fetching payment status for group:", paymentsError);
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
      } catch (error) {
        logger.error("Exception in group subscribers fetch:", error);
        return [];
      }
    },
    enabled: !!groupId
  });
};
