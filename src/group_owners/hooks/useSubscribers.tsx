
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
        first_name,
        last_name,
        is_trial,
        trial_end_date,
        payment_status,
        metadata,
        subscription_plan_id
      `)
      .eq("community_id", communityId);

    if (membersError) {
      console.error("Error fetching subscribers:", membersError);
      return [];
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

    // Map the members with their plans
    return members.map(member => ({
      ...member,
      plan: member.subscription_plan_id ? plansData[member.subscription_plan_id] : null
    }));
  };

  return useQuery({
    queryKey: ["subscribers", communityId],
    queryFn: fetchSubscribers,
    enabled: !!communityId,
  });
};
