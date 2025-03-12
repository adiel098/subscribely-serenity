
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function fetchCommunities() {
  try {
    // Fetch communities with their owner profiles, member counts, and subscription data
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

    // For each community, fetch the actual member and subscription counts from community_subscribers
    if (communities && communities.length > 0) {
      const communitiesWithCounts = await Promise.all(communities.map(async (community) => {
        // Get member count - all active members
        const { data: memberData, error: memberError } = await supabase
          .from('community_subscribers') // Updated from telegram_chat_members
          .select('id', { count: 'exact' })
          .eq('community_id', community.id)
          .eq('is_active', true);

        if (memberError) {
          console.error(`Error fetching member count for community ${community.id}:`, memberError);
        }

        // Get subscription count - active members with active subscriptions
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('community_subscribers') // Updated from telegram_chat_members
          .select('id', { count: 'exact' })
          .eq('community_id', community.id)
          .eq('is_active', true)
          .eq('subscription_status', 'active'); // Updated from boolean to 'active' string

        if (subscriptionError) {
          console.error(`Error fetching subscription count for community ${community.id}:`, subscriptionError);
        }

        return {
          ...community,
          member_count: memberData?.length || 0,
          subscription_count: subscriptionData?.length || 0
        };
      }));

      console.log("Communities with actual counts:", communitiesWithCounts);
      return communitiesWithCounts;
    }

    console.log("Raw communities data:", communities);
    return communities;
  } catch (error) {
    console.error("Error in communities fetch service:", error);
    toast.error("An error occurred while fetching communities");
    return [];
  }
}
