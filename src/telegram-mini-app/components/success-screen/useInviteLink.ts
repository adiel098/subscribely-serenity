
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useInviteLink = (initialInviteLink: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  
  // Log the invite link for debugging
  useEffect(() => {
    console.log('Community invite link in useInviteLink:', initialInviteLink);
    if (initialInviteLink) {
      setInviteLink(initialInviteLink);
    } else {
      // If no invite link is provided, try to fetch it from recent payments
      fetchInviteLinkFromRecentPayment();
    }
  }, [initialInviteLink]);

  // Attempt to fetch invite link from the most recent payment if not provided
  const fetchInviteLinkFromRecentPayment = async () => {
    if (inviteLink) return;
    
    setIsLoadingLink(true);
    try {
      console.log('Attempting to fetch invite link from recent payments...');
      
      // Try to get the most recent payment with an invite link
      const { data: recentPayment, error } = await supabase
        .from('subscription_payments')
        .select('invite_link, community_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching recent payment:', error);
      } else if (recentPayment && recentPayment.length > 0 && recentPayment[0].invite_link) {
        console.log('Found invite link in recent payment:', recentPayment[0].invite_link);
        setInviteLink(recentPayment[0].invite_link);
      } else if (recentPayment && recentPayment.length > 0 && recentPayment[0].community_id) {
        // If we found a payment but no invite link, try to get the invite link from the community
        console.log('Found community ID in recent payment:', recentPayment[0].community_id);
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('telegram_invite_link')
          .eq('id', recentPayment[0].community_id)
          .single();
        
        if (communityError) {
          console.error('Error fetching community:', communityError);
        } else if (community?.telegram_invite_link) {
          console.log('Found invite link in community:', community.telegram_invite_link);
          setInviteLink(community.telegram_invite_link);
        }
      }
    } catch (err) {
      console.error('Error in fetchInviteLinkFromRecentPayment:', err);
    } finally {
      setIsLoadingLink(false);
    }
  };

  return { inviteLink, isLoadingLink };
};
