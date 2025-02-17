
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  telegram_username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: boolean;
  joined_at: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  plan: {
    id: string;
    name: string;
    interval: string;
    price: number;
  } | null;
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_chat_members')
        .select(`
          id,
          telegram_username,
          full_name,
          avatar_url,
          subscription_status,
          joined_at,
          subscription_start_date,
          subscription_end_date,
          plan:subscription_plans(
            id,
            name,
            interval,
            price
          )
        `);

      if (error) throw error;
      return data as unknown as Customer[];
    }
  });
};
