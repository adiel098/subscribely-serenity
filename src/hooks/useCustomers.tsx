
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
  communities: {
    id: string;
    name: string;
    platform: string;
    member_count: number;
    subscription_count: number;
  }[];
}

interface UseCustomersOptions {
  searchTerm?: string;
  statusFilter?: string;
}

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const { searchTerm, statusFilter } = options;

  return useQuery({
    queryKey: ['customers', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
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

      if (searchTerm) {
        query = query.textSearch('full_name', searchTerm, {
          config: 'simple'
        });
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data as Customer[];
    }
  });
};
