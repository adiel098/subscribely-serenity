
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  status: string;
  registration_date: string;
  last_login: string | null;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
  is_subscribed: boolean;
  communities: {
    id: string;
    name: string;
    platform: string;
    member_count: number;
    subscription_count: number;
  }[];
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          communities (
            id,
            name,
            platform,
            member_count,
            subscription_count
          )
        `);

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data.map((profile: any) => ({
        ...profile,
        is_subscribed: profile.status === 'subscribed'
      })) as Customer[];
    }
  });
};
