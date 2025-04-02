
/**
 * Core utilities for interacting with the Telegram Bot API
 */

// Function to validate inline keyboard structure for compliance with Telegram requirements
export function validateInlineKeyboard(keyboard: any): { valid: boolean, reason?: string } {
  // If no keyboard is provided, it's valid (no keyboard)
  if (!keyboard) {
    return { valid: true };
  }
  
  try {
    // Check if it has the correct inline_keyboard property
    if (!keyboard.inline_keyboard || !Array.isArray(keyboard.inline_keyboard)) {
      return { valid: false, reason: 'No inline_keyboard array found' };
    }
    
    // Check each row
    for (const row of keyboard.inline_keyboard) {
      if (!Array.isArray(row)) {
        return { valid: false, reason: 'Row is not an array' };
      }
      
      // Check each button in the row
      for (const button of row) {
        // All buttons must have text
        if (!button.text) {
          return { valid: false, reason: 'Button missing text property' };
        }
        
        // Each button must have exactly one of the following properties:
        // url, callback_data, web_app, etc.
        const actionProperties = [
          'url', 'callback_data', 'web_app', 'switch_inline_query',
          'switch_inline_query_current_chat', 'callback_game', 'pay'
        ];
        
        const propertiesPresent = actionProperties.filter(prop => button[prop] !== undefined);
        
        if (propertiesPresent.length !== 1) {
          return { 
            valid: false, 
            reason: `Button must have exactly one action property, found ${propertiesPresent.length}: ${propertiesPresent.join(', ')}` 
          };
        }
        
        // Validate web_app URLs if present (must be https)
        if (button.web_app && button.web_app.url) {
          const url = button.web_app.url;
          if (!url.startsWith('https://')) {
            return { valid: false, reason: `web_app URL must use HTTPS: ${url}` };
          }
          
          try {
            // Verify it's a valid URL
            new URL(url);
          } catch (e) {
            return { valid: false, reason: `Invalid URL in web_app: ${url}` };
          }
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: `Validation error: ${error.message}` };
  }
}
