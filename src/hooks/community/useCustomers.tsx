
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/features/community/components/customers/CustomersTable";

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

      return data.map((profile: any) => ({
        ...profile,
        is_subscribed: profile.status === 'active'
      })) as Customer[];
    }
  });
};
