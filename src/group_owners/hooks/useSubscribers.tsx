import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const fetchSubscribers = async (): Promise<Subscriber[]> => {
    if (!communityId) return [];

    // Fetch subscribers from database
    const { data: members, error: membersError } = await supabase
      .from("telegram_chat_members")
      .select(`
        id,
        telegram_user_id,
        telegram_username,
        community_id,
        joined_at,
        last_active,
        subscription_status,
        is_active,
        subscription_start_date,
        subscription_end_date,
        is_trial,
        trial_end_date,
        subscription_plan_id
      `)
      .eq("community_id", communityId);

    if (membersError) {
      console.error("Error fetching subscribers:", membersError);
      return [];
    }

    // Create a map to store user details
    const userDetails: Record<string, { first_name: string | null, last_name: string | null }> = {};
    
    // Fetch user details from telegram_mini_app_users for all telegram_user_ids
    if (members.length > 0) {
      const telegramIds = members.map(member => member.telegram_user_id);
      
      const { data: users, error: usersError } = await supabase
        .from("telegram_mini_app_users")
        .select(`
          telegram_id,
          first_name,
          last_name
        `)
        .in("telegram_id", telegramIds);
        
      if (usersError) {
        console.error("Error fetching user details:", usersError);
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

    // Get all plan IDs to fetch plan data separately
    const planIds = members
      .filter(member => member.subscription_plan_id)
      .map(member => member.subscription_plan_id);

    // If there are plan IDs, fetch plans
    let plansData: Record<string, any> = {};
    
    if (planIds.length > 0) {
      const { data: plans, error: plansError } = await supabase
        .from("subscription_plans")
        .select(`
          id,
          name,
          price,
          interval
        `)
        .in("id", planIds);

      if (plansError) {
        console.error("Error fetching subscription plans:", plansError);
      } else if (plans) {
        // Create a map of plans by ID for easy lookup
        plansData = plans.reduce((acc, plan) => {
          acc[plan.id] = plan;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Get payment status from subscription_payments table
    const paymentStatusMap: Record<string, string> = {};
    
    if (members.length > 0) {
      const telegramUserIds = members.map(member => member.telegram_user_id);
      
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
        console.error("Error fetching payment status:", paymentsError);
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

    // Map the members with their plans, user details and payment status
    return members.map(member => ({
      ...member,
      // Add first_name and last_name from the user details map or use null if not found
      first_name: userDetails[member.telegram_user_id]?.first_name || null,
      last_name: userDetails[member.telegram_user_id]?.last_name || null,
      // Add payment status from payment status map or use null if not found
      payment_status: paymentStatusMap[member.telegram_user_id] || null,
      plan: member.subscription_plan_id ? plansData[member.subscription_plan_id] : null
    }));
  };

  return useQuery({
    queryKey: ["subscribers", communityId],
    queryFn: fetchSubscribers,
    enabled: !!communityId,
  });
};
