
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction } from "./utils";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("payment-useInviteLink");

/**
 * Hook to manage invite link fetching and creation
 */
export const useInviteLink = (initialInviteLink: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink);

  // Log the invite link for debugging
  useEffect(() => {
    logPaymentAction('Initial community invite link', initialInviteLink);
    if (initialInviteLink) {
      setInviteLink(initialInviteLink);
    }
  }, [initialInviteLink]);

  /**
   * Function to fetch or create an invite link
   */
  const fetchOrCreateInviteLink = async (communityId: string, forceNew = false) => {
    logPaymentAction('Attempting to fetch or create invite link', { communityId, forceNew });
    
    try {
      if (!forceNew) {
        // First try to get the invite link from the community record
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('telegram_invite_link, custom_link')
          .eq('id', communityId)
          .single();
        
        if (communityError) {
          logger.error('Error fetching community:', communityError);
        } else if (community?.telegram_invite_link) {
          logPaymentAction('Found invite link in community record', community.telegram_invite_link);
          setInviteLink(community.telegram_invite_link);
          return community.telegram_invite_link;
        }
      }
      
      // If no invite link was found or forceNew is true, try to create one using the edge function
      logPaymentAction('Calling create-invite-link function', { communityId, forceNew });
      const { data, error } = await supabase.functions.invoke('create-invite-link', {
        body: { communityId, forceNew }
      });
      
      if (error) {
        logger.error('Error calling create-invite-link function:', error);
        throw new Error(`Failed to create invite link: ${error.message}`);
      }
      
      if (data?.inviteLink) {
        logPaymentAction('Successfully created invite link', data.inviteLink);
        setInviteLink(data.inviteLink);
        return data.inviteLink;
      } else {
        logger.error('No invite link returned from function:', data);
        throw new Error('No invite link returned from function');
      }
    } catch (err) {
      logger.error('Error in fetchOrCreateInviteLink:', err);
      return null;
    }
  };

  return {
    inviteLink,
    setInviteLink,
    fetchOrCreateInviteLink
  };
};
