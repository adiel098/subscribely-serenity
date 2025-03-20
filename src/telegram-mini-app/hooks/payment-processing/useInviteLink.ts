
import { useState } from "react";
import { createInviteLink } from "../../services/paymentService";

export const useInviteLink = (initialInviteLink?: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink || null);

  const fetchOrCreateInviteLink = async (communityId: string, forceRefresh: boolean = false) => {
    try {
      // If we already have an invite link and don't need to refresh, return it
      if (inviteLink && !forceRefresh) {
        console.log("[useInviteLink] Using existing invite link:", inviteLink);
        return inviteLink;
      }

      console.log("[useInviteLink] Fetching or creating new invite link for community:", communityId);
      
      // Generate a new invite link
      const newInviteLink = await createInviteLink(communityId);
      
      if (newInviteLink) {
        console.log("[useInviteLink] Successfully created invite link:", newInviteLink);
        setInviteLink(newInviteLink);
        return newInviteLink;
      } else {
        console.error("[useInviteLink] Failed to create invite link");
        return null;
      }
    } catch (err) {
      console.error("[useInviteLink] Error creating invite link:", err);
      return null;
    }
  };

  return {
    inviteLink,
    setInviteLink,
    fetchOrCreateInviteLink
  };
};
