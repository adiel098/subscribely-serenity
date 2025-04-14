
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "../../../utils/debugUtils";

const logger = createLogger("inviteLinkService");

/**
 * Calls the edge function to get group data for a community
 */
export const fetchGroupData = async (communityId: string) => {
  try {
    logger.log(`Checking if ${communityId} is a group`);
    
    const response = await supabase.functions.invoke('create-invite-link', {
      body: { communityId }
    });
    
    logger.log('Response from create-invite-link:', response);
    
    if (response.error) {
      logger.error('Error checking if group link:', response.error);
      return { error: response.error };
    }
    
    return { data: response.data };
  } catch (err) {
    logger.error('Error in fetchGroupData:', err);
    return { error: err };
  }
};

/**
 * Fetches the most recent payment for a user
 */
export const fetchRecentPayment = async () => {
  try {
    const { data: recentPayment, error: paymentError } = await supabase
      .from('project_payments')
      .select('id, project_id')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (paymentError) {
      logger.error('Error fetching recent payment:', paymentError);
      return { error: paymentError };
    }
    
    if (!recentPayment || recentPayment.length === 0 || !recentPayment[0].community_id) {
      logger.error('No recent payment or community ID found');
      return { error: new Error('No recent payment found') };
    }
    
    return { 
      data: {
        paymentId: recentPayment[0].id,
        communityId: recentPayment[0].community_id
      }
    };
  } catch (err) {
    logger.error('Error in fetchRecentPayment:', err);
    return { error: err };
  }
};

/**
 * Updates a payment record with new invite link information
 */
export const updatePaymentWithInviteLink = async (paymentId: string, inviteLink: string) => {
  try {
    const { error: updateError } = await supabase
      .from('project_payments')
      .update({ invite_link: inviteLink })
      .eq('id', paymentId);
      
    if (updateError) {
      logger.error('Error updating payment with invite link:', updateError);
      return { error: updateError };
    }
    
    logger.log('Updated payment record with invite link');
    return { success: true };
  } catch (err) {
    logger.error('Error in updatePaymentWithInviteLink:', err);
    return { error: err };
  }
};
