
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("useChannelInviteLink");

/**
 * Hook for managing channel/community invite links
 */
export const useChannelInviteLink = (initialInviteLink?: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches or creates an invite link for a community
   */
  const fetchOrCreateInviteLink = async (communityId: string, forceRefresh: boolean = false) => {
    try {
      // If we already have an invite link and don't need to refresh, return it
      if (inviteLink && !forceRefresh) {
        logger.log(`Using existing invite link: ${inviteLink}`);
        return inviteLink;
      }

      logger.log(`Creating invite link for community: ${communityId}`);
      setIsLoading(true);
      setError(null);
      
      // Call the create-invite-link edge function
      const { data, error: fnError } = await supabase.functions.invoke("create-invite-link", {
        body: { communityId, forceNew: forceRefresh }
      });
      
      if (fnError) {
        logger.error(`Error creating invite link: ${fnError.message}`);
        setError(fnError.message);
        return null;
      }
      
      if (data?.inviteLink) {
        logger.log(`Successfully created invite link: ${data.inviteLink}`);
        setInviteLink(data.inviteLink);
        return data.inviteLink;
      } else {
        logger.warn("No invite link returned from the function");
        setError("No invite link generated");
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error(`Error in fetchOrCreateInviteLink: ${errorMessage}`);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inviteLink,
    setInviteLink,
    isLoading,
    error,
    fetchOrCreateInviteLink
  };
};
