
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user:users(*)
        `);

      if (error) throw error;
      return data as Customer[];
    }
  });
};
