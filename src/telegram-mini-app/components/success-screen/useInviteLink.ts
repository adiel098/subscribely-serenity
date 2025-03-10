
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useInviteLink = (initialInviteLink: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  
  // Generate a new invite link after successful payment
  useEffect(() => {
    console.log('Community invite link in useInviteLink:', initialInviteLink);
    
    // Always generate a new invite link regardless of initial link
    generateNewInviteLink();
    
  }, [initialInviteLink]);

  // Generate a fresh invite link for this member
  const generateNewInviteLink = async () => {
    setIsLoadingLink(true);
    try {
      console.log('Generating new invite link for renewal...');
      
      // Get community ID from recent payment
      const { data: recentPayment, error: paymentError } = await supabase
        .from('subscription_payments')
        .select('community_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (paymentError) {
        console.error('Error fetching recent payment:', paymentError);
        return;
      }
      
      if (!recentPayment || recentPayment.length === 0 || !recentPayment[0].community_id) {
        console.error('No recent payment or community ID found');
        return;
      }
      
      const communityId = recentPayment[0].community_id;
      console.log(`Found community ID for invite link generation: ${communityId}`);
      
      // Call the create-invite-link edge function with forceNew=true
      const response = await supabase.functions.invoke('create-invite-link', {
        body: { 
          communityId: communityId,
          forceNew: true 
        }
      });
      
      if (response.error) {
        console.error('Error generating new invite link:', response.error);
        return;
      }
      
      if (response.data?.inviteLink) {
        console.log('Generated new invite link:', response.data.inviteLink);
        setInviteLink(response.data.inviteLink);
        
        // Update the most recent payment with the new link
        const { error: updateError } = await supabase
          .from('subscription_payments')
          .update({ invite_link: response.data.inviteLink })
          .eq('id', recentPayment[0].id);
          
        if (updateError) {
          console.error('Error updating payment with new invite link:', updateError);
        } else {
          console.log('Updated payment record with new invite link');
        }
      } else {
        console.error('No invite link received from function');
      }
    } catch (err) {
      console.error('Error in generateNewInviteLink:', err);
    } finally {
      setIsLoadingLink(false);
    }
  };

  return { inviteLink, isLoadingLink };
};
