
// Bot utility constants and functions

// Mini App URLs - updated to ensure valid HTTPS format for buttons
export const TELEGRAM_MINI_APP_URL = 'https://t.me/YourBotUsername/app';
export const MINI_APP_WEB_URL = 'https://app.membify.dev';

/**
 * Generate a valid Telegram web_app URL for buttons
 * @param communityIdOrLink Community ID or custom link
 * @returns A properly formatted HTTPS URL that Telegram will accept
 */
export function getMiniAppUrl(communityIdOrLink: string): string {
  if (!communityIdOrLink) {
    return MINI_APP_WEB_URL;
  }
  
  // Always use direct HTTPS URLs for buttons, not t.me links
  const url = new URL(MINI_APP_WEB_URL);
  url.searchParams.set('start', communityIdOrLink);
  
  return url.toString();
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Sanitize text for HTML in Telegram messages
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get time difference in days between two dates
 */
export function getDaysDifference(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
