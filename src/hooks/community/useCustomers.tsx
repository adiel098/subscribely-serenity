
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
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
          *,
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
