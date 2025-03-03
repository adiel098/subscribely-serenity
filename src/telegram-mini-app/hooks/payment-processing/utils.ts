
/**
 * Utility functions for payment processing
 */

/**
 * Log payment-related actions with consistent formatting and detail
 */
export const logPaymentAction = (action: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[Payment Processing ${timestamp}] ${action}:`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
};

/**
 * Validate required payment parameters
 */
export const validatePaymentParams = (
  telegramUserId?: string, 
  communityId?: string, 
  planId?: string
): { isValid: boolean; error?: string } => {
  console.log(`[validatePaymentParams] Validating payment parameters:
    - telegramUserId: ${telegramUserId}, type: ${typeof telegramUserId}
    - communityId: ${communityId}, type: ${typeof communityId}
    - planId: ${planId}, type: ${typeof planId}
  `);
  
  if (!telegramUserId) {
    console.error(`[validatePaymentParams] Missing telegramUserId`);
    return { isValid: false, error: "User ID not found. Please try again later." };
  }
  
  if (!communityId) {
    console.error(`[validatePaymentParams] Missing communityId`);
    return { isValid: false, error: "Community ID is required for payment processing." };
  }
  
  if (!planId) {
    console.error(`[validatePaymentParams] Missing planId`);
    return { isValid: false, error: "Plan ID is required for payment processing." };
  }
  
  console.log(`[validatePaymentParams] All parameters are valid`);
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
    console.log(`[logSubscriptionActivity] Logging activity: ${activityType} for user ${telegramUserId}`);
    const { supabase } = await import("@/integrations/supabase/client");
    
    const activityData = {
      telegram_user_id: telegramUserId,
      community_id: communityId,
      activity_type: activityType,
      details
    };
    console.log(`[logSubscriptionActivity] Activity data:`, JSON.stringify(activityData, null, 2));
    
    const { error } = await supabase
      .from('subscription_activity_logs')
      .insert(activityData);
      
    if (error) {
      console.error(`[logSubscriptionActivity] Failed to log subscription activity:`, error);
    } else {
      console.log(`[logSubscriptionActivity] Activity logged successfully`);
    }
  } catch (err) {
    console.error("[logSubscriptionActivity] Error:", err);
  }
};
