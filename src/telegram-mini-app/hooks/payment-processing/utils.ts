
/**
 * Utility functions for payment processing
 */

/**
 * Log payment-related actions with consistent formatting
 */
export const logPaymentAction = (action: string, data?: any) => {
  console.log(`[Payment Processing] ${action}:`, data !== undefined ? data : '');
};

/**
 * Validate required payment parameters
 */
export const validatePaymentParams = (
  telegramUserId?: string, 
  communityId?: string, 
  planId?: string
): { isValid: boolean; error?: string } => {
  if (!telegramUserId) {
    return { isValid: false, error: "User ID not found. Please try again later." };
  }
  
  if (!communityId) {
    return { isValid: false, error: "Community ID is required for payment processing." };
  }
  
  if (!planId) {
    return { isValid: false, error: "Plan ID is required for payment processing." };
  }
  
  return { isValid: true };
};

/**
 * Log subscription activity to the database
 */
export const logSubscriptionActivity = async (
  telegramUserId: string,
  communityId: string,
  activityType: string,
  details?: string
) => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { error } = await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: telegramUserId,
        community_id: communityId,
        activity_type: activityType,
        details
      });
      
    if (error) {
      console.error(`Failed to log subscription activity: ${error.message}`);
    }
  } catch (err) {
    console.error("Error logging subscription activity:", err);
  }
};
