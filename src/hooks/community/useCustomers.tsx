
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  company_name: string;
  initial_telegram_code: string;
  current_telegram_code: string;
  last_login: string;
  status: string;
  role: string;
  avatar_url: string;
  profile: any;
  communities: {
    id: string;
    name: string;
    platform: string;
    member_count: number;
    subscription_count: number;
    subscription_revenue: number;
  }[];
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select(`
          *,
          communities:community_members(
            id,
            name,
            platform,
            member_count,
            subscription_count,
            subscription_revenue
          )
        `);

      if (error) {
        throw error;
      }

      return data as unknown as Customer[];
    },
  });
};
