
import { AdminCommunity } from "@/admin/hooks/useAdminCommunities";

/**
 * Processes raw community data from Supabase into the AdminCommunity format
 */
export function processCommunityData(communities: any[]): AdminCommunity[] {
  if (!communities || !Array.isArray(communities)) {
    return [];
  }
  
  return communities.map(community => {
    // Calculate total revenue from subscription payments
    let totalRevenue = 0;
    if (community.project_payments && Array.isArray(community.project_payments)) {
      totalRevenue = community.project_payments.reduce((sum, payment) => {
        return sum + (parseFloat(payment.amount) || 0);
      }, 0);
    }

    // Determine status based on data
    let status = "active";
    if ((community.member_count === 0 || community.member_count === null) && 
        (community.subscription_count === 0 || community.subscription_count === null)) {
      status = "inactive";
    } else if (community.is_suspended) {
      status = "suspended";
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
}
