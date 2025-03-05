
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminCommunity {
  id: string;
  name: string;
  owner_id: string;
  owner_name?: string;
  members: number;
  subscriptions: number;
  revenue: number;
  status: string;
  photoUrl: string | null;
}

export const useAdminCommunities = () => {
  return useQuery({
    queryKey: ["admin-communities"],
    queryFn: async (): Promise<AdminCommunity[]> => {
      try {
        // Fetch communities with their owner profiles and subscription data
        const { data: communities, error } = await supabase
          .from('communities')
          .select(`
            *,
            profiles:owner_id (
              full_name
            ),
            subscription_payments(amount)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching communities:", error);
          toast.error("Failed to fetch communities");
          throw error;
        }

        console.log("Raw communities data:", communities);

        // Transform the data to match our AdminCommunity interface
        const formattedCommunities: AdminCommunity[] = communities.map(community => {
          // Calculate total revenue from subscription payments
          let totalRevenue = 0;
          if (community.subscription_payments && Array.isArray(community.subscription_payments)) {
            totalRevenue = community.subscription_payments.reduce((sum, payment) => {
              return sum + (parseFloat(payment.amount) || 0);
            }, 0);
          }

          // Determine status based on data
          let status = "active";
          if (community.member_count === 0 && community.subscription_count === 0) {
            status = "inactive";
          }

          return {
            id: community.id,
            name: community.name,
            owner_id: community.owner_id,
            owner_name: community.profiles?.full_name || "Unknown Owner",
            members: community.member_count || 0,
            subscriptions: community.subscription_count || 0,
            revenue: totalRevenue || community.subscription_revenue || 0,
            status: status,
            photoUrl: community.telegram_photo_url
          };
        });

        console.log("Formatted communities:", formattedCommunities);
        return formattedCommunities;
      } catch (error) {
        console.error("Error in communities query:", error);
        toast.error("An error occurred while fetching communities");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
};
