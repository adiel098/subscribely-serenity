
/**
 * Utility to get the bot username from environment variables
 * Ensures consistent access across all components
 */
export const getBotUsername = (): string => {
  // In Vite, environment variables must be prefixed with VITE_ and accessed via import.meta.env
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'membifybot';
  
  // Log the username we're using for debugging
  console.log("🤖 Using bot username:", botUsername);
  
  return botUsername;
};
