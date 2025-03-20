
import { useState } from "react";

export const usePaymentInviteLink = () => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  
  const processInviteLink = async (
    communityInviteLink: string | null | undefined,
    fetchOrCreateInviteLink: Function,
    communityId: string,
    paymentInviteLink?: string | null
  ) => {
    try {
      let finalInviteLink = communityInviteLink;
      
      // Get an invite link if we don't have one yet or generate a new one
      if (!communityInviteLink) {
        console.log("[usePaymentInviteLink] No invite link provided, generating a new one");
        const generatedLink = await fetchOrCreateInviteLink(communityId);
        
        if (generatedLink) {
          finalInviteLink = generatedLink;
          console.log("[usePaymentInviteLink] Successfully generated invite link:", finalInviteLink);
        } else {
          console.warn("[usePaymentInviteLink] Could not generate invite link, proceeding without one");
        }
      }
      
      // Check if the invite link is for a group (begins with { for JSON)
      let isGroupSubscription = false;
      if (finalInviteLink && (finalInviteLink.startsWith('{') || finalInviteLink.includes('"isGroup":true'))) {
        isGroupSubscription = true;
        console.log("[usePaymentInviteLink] Detected a group subscription with JSON invite links");
      }
      
      // Use the invite link from the payment record if available
      if (paymentInviteLink) {
        setInviteLink(paymentInviteLink);
        console.log("[usePaymentInviteLink] Using invite link from payment record:", paymentInviteLink);
        return paymentInviteLink;
      } else if (finalInviteLink) {
        setInviteLink(finalInviteLink);
        console.log("[usePaymentInviteLink] Using original invite link:", finalInviteLink);
        return finalInviteLink;
      }
      
      return finalInviteLink;
    } catch (error) {
      console.error("[usePaymentInviteLink] Error processing invite link:", error);
      return communityInviteLink;
    }
  };
  
  return {
    inviteLink,
    setInviteLink,
    processInviteLink
  };
};
