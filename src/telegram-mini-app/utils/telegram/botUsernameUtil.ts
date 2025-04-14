
import { supabase } from "@/integrations/supabase/client";
import { getCachedBotUsername, setCachedBotUsername } from "./botUsernameCache";

/**
 * Get the bot username from platform settings with caching
 */
export const getBotUsername = () => {
  // Check cache first
  const cachedUsername = getCachedBotUsername();
  if (cachedUsername) {
    return cachedUsername;
  }
  
  // Log only once when fetching (not cached)
  console.log("🤖 Fetching bot username from server");
  
  // Fetch from server asynchronously and update cache
  fetchAndCacheBotUsername();
  
  // Return default while waiting
  return "membifybot";
};

// Separate async function to fetch and update cache
async function fetchAndCacheBotUsername() {
  try {
    const { data, error } = await supabase
      .from("platform_global_settings")
      .select("bot_username")
      .single();
      
    if (error) {
      console.error("Error fetching bot username:", error);
      return;
    }
    
    if (data?.bot_username) {
      // Store in cache
      setCachedBotUsername(data.bot_username);
      console.log("🤖 Bot username cached:", data.bot_username);
    }
  } catch (err) {
    console.error("Exception fetching bot username:", err);
  }
}

/**
 * Get the bot username - async version for hooks
 */
export const fetchBotUsername = async (): Promise<string> => {
  // Check cache first
  const cachedUsername = getCachedBotUsername();
  if (cachedUsername) {
    return cachedUsername;
  }
  
  try {
    const { data, error } = await supabase
      .from("platform_global_settings")
      .select("bot_username")
      .single();
      
    if (error) {
      console.error("Error fetching bot username:", error);
      return "membifybot"; // Default fallback
    }
    
    if (data?.bot_username) {
      // Store in cache
      setCachedBotUsername(data.bot_username);
      return data.bot_username;
    }
    
    return "membifybot"; // Default fallback
  } catch (err) {
    console.error("Exception fetching bot username:", err);
    return "membifybot"; // Default fallback
  }
};
