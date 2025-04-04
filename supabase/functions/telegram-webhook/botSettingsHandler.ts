import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getBotSettings(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    // Input validation
    if (!communityId) {
      console.error("[BOT SETTINGS] ❌ Error: No communityId provided");
      throw new Error('Community ID must be provided');
    }
    
    console.log(`[BOT SETTINGS] 🔍 Fetching bot settings for entity ${communityId}`);
    
    // Build the query based on provided parameters
    const query = supabase
      .from('telegram_bot_settings')
      .select('*, use_custom_bot, custom_bot_token')
      .eq('community_id', communityId);
    
    // Execute query
    const { data: settings, error } = await query.single();

    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error fetching bot settings for entity ${communityId}:`, error);
      
      // If settings don't exist, we should consider creating default settings
      // This is handled by the trigger in the database, but we'll log it here
      if (error.code === 'PGRST116') {
        console.log(`[BOT SETTINGS] ⚠️ Bot settings not found for entity ${communityId}`);
      }
      
      throw error;
    }

    console.log(`[BOT SETTINGS] ✅ Successfully retrieved bot settings for entity ${communityId}`);
    return settings;
  } catch (error) {
    console.error('[BOT SETTINGS] ❌ Error in getBotSettings:', error);
    throw error;
  }
}

export async function updateBotSettings(
  supabase: ReturnType<typeof createClient>, 
  settings: Record<string, any>, 
  communityId: string
) {
  try {
    // Input validation
    if (!communityId) {
      console.error("[BOT SETTINGS] ❌ Error: No communityId provided for update");
      throw new Error('Community ID must be provided for update');
    }
    
    console.log(`[BOT SETTINGS] 🔄 Updating bot settings for entity ${communityId}`);
    
    // Build the query based on provided parameters
    const query = supabase
      .from('telegram_bot_settings')
      .update(settings)
      .eq('community_id', communityId);
    
    // Execute query with returning set to minimal to reduce payload size
    const { data, error } = await query.select('id').single();

    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error updating bot settings for entity ${communityId}:`, error);
      throw error;
    }

    console.log(`[BOT SETTINGS] ✅ Successfully updated bot settings for entity ${communityId}`);
    return data;
  } catch (error) {
    console.error('[BOT SETTINGS] ❌ Error in updateBotSettings:', error);
    throw error;
  }
}

export async function getBotToken(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  defaultBotToken: string
): Promise<string> {
  try {
    // Get bot settings for this community
    const { data, error } = await supabase
      .from('telegram_bot_settings')
      .select('use_custom_bot, custom_bot_token')
      .eq('community_id', communityId)
      .single();
    
    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error fetching bot token:`, error);
      // Fallback to default bot
      return defaultBotToken;
    }
    
    // If custom bot is enabled and token is available, use it
    if (data?.use_custom_bot && data?.custom_bot_token) {
      console.log(`[BOT SETTINGS] 🔑 Using custom bot token for community ${communityId}`);
      return data.custom_bot_token;
    }
    
    // Otherwise use default bot
    console.log(`[BOT SETTINGS] 🔑 Using default bot token for community ${communityId}`);
    return defaultBotToken;
  } catch (error) {
    console.error(`[BOT SETTINGS] ❌ Error getting bot token:`, error);
    // Fallback to default bot in case of any error
    return defaultBotToken;
  }
}
