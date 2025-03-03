
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
