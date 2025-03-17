
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
      // Call the edge function to create an invite link
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
