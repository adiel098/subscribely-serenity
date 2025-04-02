
import { ValidationResult, BroadcastRequest } from '../types/types.ts';
import { createLogger } from '../../_shared/logger.ts';

const logger = createLogger('validators');

export function validateRequest(data: BroadcastRequest): ValidationResult {
  if (!data) {
    return { valid: false, error: 'No request data provided' };
  }

  if (!data.entityId) {
    return { valid: false, error: 'entityId is required' };
  }

  if (!data.message && !data.image) {
    return { valid: false, error: 'Either message or image is required' };
  }

  if (data.filterType === 'plan' && !data.planId) {
    return { valid: false, error: 'planId is required when filterType is plan' };
  }

  return { valid: true };
}

export function validateInlineKeyboard(keyboard: any): ValidationResult {
  // If no keyboard is provided, it's valid (no keyboard)
  if (!keyboard) {
    return { valid: true };
  }
  
  try {
    // Check if it has the correct inline_keyboard property
    if (!keyboard.inline_keyboard || !Array.isArray(keyboard.inline_keyboard)) {
      return { valid: false, error: 'No inline_keyboard array found' };
    }
    
    // Check each row
    for (const row of keyboard.inline_keyboard) {
      if (!Array.isArray(row)) {
        return { valid: false, error: 'Row is not an array' };
      }
      
      // Check each button in the row
      for (const button of row) {
        // All buttons must have text
        if (!button.text) {
          return { valid: false, error: 'Button missing text property' };
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
            error: `Button must have exactly one action property, found ${propertiesPresent.length}: ${propertiesPresent.join(', ')}` 
          };
        }
        
        // Validate web_app URLs if present (must be https)
        if (button.web_app && button.web_app.url) {
          const url = button.web_app.url;
          if (!url.startsWith('https://')) {
            return { valid: false, error: `web_app URL must use HTTPS: ${url}` };
          }
          
          try {
            // Verify it's a valid URL
            new URL(url);
          } catch (e) {
            return { valid: false, error: `Invalid URL in web_app: ${url}` };
          }
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}
