
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
  plan?: {
    id: string;
    name: string;
    price: number;
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
    const { data, error } = await supabase
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
        payment_status,
        metadata,
        subscription_plans:plan_id (
          id,
          name,
          price
        )
      `)
      .eq("community_id", communityId);

    if (error) {
      console.error("Error fetching subscribers:", error);
      return [];
    }

    // Map the data to match our Subscriber interface
    return data.map((member: any) => ({
      ...member,
      plan: member.subscription_plans
    }));
  };

  return useQuery({
    queryKey: ["subscribers", communityId],
    queryFn: fetchSubscribers,
    enabled: !!communityId,
  });
};
