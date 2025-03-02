
/**
 * Re-export all Telegram utilities from the organized structure
 * This file ensures backward compatibility with existing imports
 */

export {
  isValidTelegramId,
  formatTelegramId,
  isDevelopment,
  parseUserFromUrlHash,
  initTelegramWebApp,
  forceExpandToFullScreen,
  ensureFullScreen
} from './telegram';
