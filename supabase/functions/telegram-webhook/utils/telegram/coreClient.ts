
/**
 * Core Telegram Bot API client utilities
 */

/**
 * Validates that a URL is a proper HTTPS URL for Telegram web_app buttons
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Basic URL validation
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || 
           parsedUrl.protocol === 'http:' || 
           url.startsWith('data:image/');
  } catch (e) {
    return false;
  }
}

/**
 * Validates that all web_app URLs in an inline keyboard are valid
 */
export function validateInlineKeyboard(keyboard: any): { valid: boolean; reason?: string } {
  // Check if keyboard is defined
  if (!keyboard) return { valid: false, reason: 'Keyboard is undefined' };
  
  try {
    // Parse if it's a string
    const keyboardObj = typeof keyboard === 'string' ? JSON.parse(keyboard) : keyboard;
    
    // Make sure inline_keyboard property exists
    if (!keyboardObj.inline_keyboard || !Array.isArray(keyboardObj.inline_keyboard)) {
      return { valid: false, reason: 'No inline_keyboard array found' };
    }
    
    // Check each button in each row
    for (const row of keyboardObj.inline_keyboard) {
      if (!Array.isArray(row)) {
        return { valid: false, reason: 'Keyboard row is not an array' };
      }
      
      for (const button of row) {
        // Check for web_app buttons
        if (button.web_app && button.web_app.url) {
          // Make sure web_app URL is HTTPS (Telegram requirement)
          if (!button.web_app.url.startsWith('https://')) {
            return { 
              valid: false, 
              reason: `Button URL must start with https:// (found: ${button.web_app.url})` 
            };
          }
        }
      }
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, reason: `Invalid keyboard format: ${e.message}` };
  }
}
