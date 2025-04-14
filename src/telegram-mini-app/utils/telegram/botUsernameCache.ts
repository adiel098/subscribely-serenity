
/**
 * Caching utility for bot usernames to prevent repeated API calls
 */
type BotUsernameCache = {
  username: string | null;
  timestamp: number;
};

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

// In-memory cache
let botUsernameCache: BotUsernameCache | null = null;

/**
 * Get the cached bot username
 */
export const getCachedBotUsername = (): string | null => {
  if (!botUsernameCache) return null;
  
  // Check if cache is expired
  const now = Date.now();
  if (now - botUsernameCache.timestamp > CACHE_EXPIRATION) {
    botUsernameCache = null;
    return null;
  }
  
  return botUsernameCache.username;
};

/**
 * Set the cached bot username
 */
export const setCachedBotUsername = (username: string): void => {
  botUsernameCache = {
    username,
    timestamp: Date.now()
  };
};

/**
 * Clear the cached bot username
 */
export const clearCachedBotUsername = (): void => {
  botUsernameCache = null;
};
