
/**
 * Core utilities for Telegram message sending
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Verify a bot token is valid by making a getMe request to Telegram API
 * @param botToken Bot token to verify
 * @returns Boolean indicating if the token is valid
 */
export async function verifyBotToken(botToken: string): Promise<boolean> {
  try {
    console.log('[TelegramSender] 🔄 Verifying bot token validity');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] ❌ Bot token verification failed:', data);
      return false;
    }
    
    console.log('[TelegramSender] ✅ Bot token verified successfully:', data.result?.username);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Bot token verification error:', error);
    return false;
  }
}

/**
 * Check if a URL is valid for Telegram
 * @param url URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export function isValidTelegramUrl(url: string): boolean {
  return url && url.startsWith('https://');
}

/**
 * Get a validated version of the mini app URL or null if invalid
 * @param miniAppUrl URL to validate
 * @returns Valid URL or null
 */
export function getValidatedMiniAppUrl(miniAppUrl: string): string | null {
  if (!miniAppUrl || !isValidTelegramUrl(miniAppUrl)) {
    console.error('[TelegramSender] ❌ Invalid mini app URL format:', miniAppUrl);
    return null;
  }
  return miniAppUrl;
}
