
/**
 * Main entry point for Telegram client functionality
 * Re-exports all Telegram API interaction functions
 */

// Export text message utilities
export { sendTelegramMessage } from "./utils/telegram/textMessages.ts";

// Export photo message utilities
export { sendPhotoWithCaption } from "./utils/telegram/photoMessages.ts";

// Export user verification utilities
export { canMessageUser } from "./utils/telegram/userVerification.ts";

// Export core utilities 
export { isValidImageUrl } from "./utils/telegram/coreClient.ts";
