
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("useInviteLink");

export const useInviteLink = (initialInviteLink: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  
  // Generate a new invite link after successful payment
  useEffect(() => {
    logger.log('Community invite link in useInviteLink:', initialInviteLink);
    
    // Always generate a new invite link regardless of initial link
    generateNewInviteLink();
    
  }, [initialInviteLink]);

  // Generate a fresh invite link for this member
  const generateNewInviteLink = async () => {
    setIsLoadingLink(true);
    try {
      logger.log('Generating new invite link for renewal...');
      
      // Get community ID from recent payment
      const { data: recentPayment, error: paymentError } = await supabase
        .from('subscription_payments')
        .select('id, community_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (paymentError) {
        logger.error('Error fetching recent payment:', paymentError);
        return;
      }
      
      if (!recentPayment || recentPayment.length === 0 || !recentPayment[0].community_id) {
        logger.error('No recent payment or community ID found');
        return;
      }
      
      const communityId = recentPayment[0].community_id;
      const paymentId = recentPayment[0].id;
      
      logger.log(`Found community ID for invite link generation: ${communityId}`);
      
      // Call the create-invite-link edge function with forceNew=true
      const response = await supabase.functions.invoke('create-invite-link', {
        body: { 
          communityId: communityId,
          forceNew: true 
        }
      });
      
      if (response.error) {
        logger.error('Error generating new invite link:', response.error);
        return;
      }
      
      if (response.data?.inviteLink) {
        logger.log('Generated new invite link:', response.data.inviteLink);
        setInviteLink(response.data.inviteLink);
        
        // Update the most recent payment with the new link
        const { error: updateError } = await supabase
          .from('subscription_payments')
          .update({ invite_link: response.data.inviteLink })
          .eq('id', paymentId);
          
        if (updateError) {
          logger.error('Error updating payment with new invite link:', updateError);
        } else {
          logger.log('Updated payment record with new invite link');
        }
      } else {
        logger.error('No invite link received from function');
      }
    } catch (err) {
      logger.error('Error in generateNewInviteLink:', err);
    } finally {
      setIsLoadingLink(false);
    }
  };

  return { inviteLink, isLoadingLink };
};
