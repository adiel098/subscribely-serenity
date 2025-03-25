
/**
 * Main entry point for Telegram messaging functionality
 * Re-exports all message related functions
 */

// Export the core messaging functions
export { sendTelegramMessage } from './telegram/textMessages.ts';
export { sendPhotoWithCaption } from './telegram/photoMessages.ts';
export { isValidTelegramUrl, isValidImageUrl, validateInlineKeyboard } from './telegram/coreClient.ts';
export { canMessageUser, getChatMember } from './telegram/userVerification.ts';

// For backwards compatibility, create an alias that maps to the individual functions
const TelegramMessenger = {
  sendTelegramMessage,
  validateInlineKeyboard,
  isValidImageUrl,
  isValidTelegramUrl,
  canMessageUser,
  getChatMember
};

// Re-export for backwards compatibility
export { TelegramMessenger };

// Import functions to make them available when importing the TelegramMessenger object
import { sendTelegramMessage } from './telegram/textMessages.ts';
import { isValidTelegramUrl, isValidImageUrl, validateInlineKeyboard } from './telegram/coreClient.ts';
import { canMessageUser, getChatMember } from './telegram/userVerification.ts';
