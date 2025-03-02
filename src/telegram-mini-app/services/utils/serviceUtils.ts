
/**
 * Shared utility functions for services
 */

/**
 * Log service actions with consistent formatting
 */
export const logServiceAction = (action: string, data?: any) => {
  console.log(`🔧 SERVICE: ${action}`, data ? data : '');
};

/**
 * Validate Telegram ID format (must be numeric string)
 */
export const validateTelegramId = (telegramId: string): boolean => {
  if (!telegramId || telegramId.trim() === '') {
    console.error('❌ Empty or null Telegram ID');
    return false;
  }
  
  // Format and validate the ID
  const formattedId = String(telegramId).trim();
  const isValid = /^\d+$/.test(formattedId);
  
  if (!isValid) {
    console.error('❌ Invalid Telegram ID format:', telegramId);
  } else {
    console.log('✅ Valid Telegram ID format:', telegramId);
  }
  
  return isValid;
};
