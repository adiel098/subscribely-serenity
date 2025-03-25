
/**
 * Core utility functions for Telegram API
 */

// Standard CORS headers for Telegram API requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validate if a string is a valid URL for Telegram
 * @param url The URL to validate
 * @returns True if the URL is valid for Telegram usage
 */
export function isValidTelegramUrl(url: string): boolean {
  try {
    // URL must be valid and use HTTPS for Telegram API
    if (!url) return false;
    
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch (e) {
    console.error(`[TELEGRAM-CORE] Invalid URL: ${url}`, e);
    return false;
  }
}

/**
 * Validate if a string is a valid image URL
 * @param url The URL to validate
 * @returns True if the URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for base64 image data
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check for URL to image
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Validate an inline keyboard object for Telegram API compatibility
 * @param keyboard The keyboard object to validate
 * @returns Validation result with status and reason if invalid
 */
export function validateInlineKeyboard(keyboard: any): { valid: boolean, reason?: string } {
  try {
    // Parse the keyboard if it's a string
    const keyboardObj = typeof keyboard === 'string' ? JSON.parse(keyboard) : keyboard;
    
    // Make sure it has the expected format
    if (!keyboardObj.inline_keyboard || !Array.isArray(keyboardObj.inline_keyboard)) {
      return { valid: false, reason: 'No inline_keyboard array found' };
    }
    
    // Check each button in the keyboard
    for (const row of keyboardObj.inline_keyboard) {
      if (!Array.isArray(row)) continue;
      
      for (const button of row) {
        // Check web_app URLs
        if (button.web_app && button.web_app.url) {
          try {
            // Test if it's a valid URL
            new URL(button.web_app.url);
            
            // Verify it starts with https://
            if (!button.web_app.url.startsWith('https://')) {
              return { valid: false, reason: `Web app URL must start with https://: ${button.web_app.url}` };
            }
          } catch (e) {
            return { valid: false, reason: `Invalid web_app URL: ${button.web_app.url}` };
          }
        }
        
        // Check URL buttons
        if (button.url) {
          try {
            new URL(button.url);
          } catch (e) {
            return { valid: false, reason: `Invalid URL button: ${button.url}` };
          }
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: `Keyboard validation error: ${error.message}` };
  }
}
