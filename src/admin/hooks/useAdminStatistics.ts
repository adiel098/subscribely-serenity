
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStatistics {
  totalCommunities: number;
  totalOwners: number;
  activeSubscribedOwners: number;
  totalMembersInCommunities: number;
  totalCommunityRevenue: number;
  totalPlatformRevenue: number;
}

export const useAdminStatistics = () => {
  return useQuery({
    queryKey: ["admin-statistics"],
    queryFn: async (): Promise<AdminStatistics> => {
      // Get total communities
      const { count: totalCommunities, error: communitiesError } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true });
      
      if (communitiesError) {
        console.error("Error fetching communities:", communitiesError);
        throw communitiesError;
      }

      // Get unique owner count (distinct owner_id)
      const { data: ownersData, error: ownersError } = await supabase
        .from('communities')
        .select('owner_id')
        .order('owner_id');
      
      if (ownersError) {
        console.error("Error fetching owners:", ownersError);
        throw ownersError;
      }

      // Get unique owners with distinct IDs
      const uniqueOwners = [...new Set(ownersData.map(item => item.owner_id))];
      const totalOwners = uniqueOwners.length;

      // Get owners with active platform subscriptions
      const { data: activeSubscribersData, error: subscribersError } = await supabase
        .from('platform_subscriptions')
        .select('owner_id')
        .eq('status', 'active')
        .order('owner_id');
      
      if (subscribersError) {
        console.error("Error fetching active subscribers:", subscribersError);
        throw subscribersError;
      }

      // Get unique subscribed owners with distinct IDs
      const uniqueSubscribedOwners = [...new Set(activeSubscribersData.map(item => item.owner_id))];
      const activeSubscribedOwners = uniqueSubscribedOwners.length;

      // Get total members from telegram_chat_members table
      const { data: membersData, error: membersError } = await supabase
        .from('telegram_chat_members')
        .select('id, community_id')
        .eq('is_active', true);
      
      if (membersError) {
        console.error("Error fetching members:", membersError);
        throw membersError;
      }

      const totalMembersInCommunities = membersData.length;

      // Get community revenue from subscription_payments table - now including both 'successful' and 'completed' statuses
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('project_payments')
        .select('amount')
        .in('status', ['successful', 'completed']);
      
      if (paymentsError) {
        console.error("Error fetching subscription payments:", paymentsError);
        throw paymentsError;
      }

      console.log(`Found ${paymentsData.length} payments with status 'successful' or 'completed'`);
      
      const totalCommunityRevenue = paymentsData.reduce((sum, payment) => 
        sum + Number(payment.amount || 0), 0);

      // Get total platform revenue
      const { data: platformPaymentsData, error: platformPaymentsError } = await supabase
        .from('platform_payments')
        .select('amount');
      
      if (platformPaymentsError) {
        console.error("Error fetching platform payments:", platformPaymentsError);
        throw platformPaymentsError;
      }

      const totalPlatformRevenue = platformPaymentsData.reduce((sum, payment) => 
        sum + Number(payment.amount || 0), 0);

      return {
        totalCommunities: totalCommunities || 0,
        totalOwners,
        activeSubscribedOwners,
        totalMembersInCommunities,
        totalCommunityRevenue,
        totalPlatformRevenue
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });
};
