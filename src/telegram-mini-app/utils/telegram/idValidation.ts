
/**
 * Utility functions for validating Telegram IDs
 */

/**
 * Checks if the provided ID is a valid Telegram ID (numeric string)
 */
export const isValidTelegramId = (id: string | number | undefined | null): boolean => {
  if (id === undefined || id === null) return false;
  
  // Convert to string and trim any whitespace
  const stringId = String(id).trim();
  console.log('🔍 Validating Telegram ID:', stringId, 'type:', typeof id);
  
  // Check if it's a numeric string
  const isValid = /^\d+$/.test(stringId);
  console.log('✅ Telegram ID validation result:', isValid);
  
  return isValid;
};

/**
 * Get a properly formatted Telegram ID string from any input
 * Returns null if the ID is invalid
 */
export const formatTelegramId = (id: string | number | undefined | null): string | null => {
  if (id === undefined || id === null) {
    console.log('❌ Null or undefined Telegram ID provided');
    return null;
  }
  
  // Convert to string and trim any whitespace
  const stringId = String(id).trim();
  console.log('🔄 Formatting Telegram ID:', stringId, 'original type:', typeof id);
  
  if (isValidTelegramId(stringId)) {
    console.log('✅ Successfully formatted Telegram ID:', stringId);
    return stringId;
  } else {
    console.error('❌ Invalid Telegram ID format:', stringId);
    return null;
  }
};
