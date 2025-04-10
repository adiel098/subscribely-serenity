
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getBotSettings(supabase: ReturnType<typeof createClient>, projectId: string) {
  try {
    // Input validation
    if (!projectId) {
      console.error("[BOT SETTINGS] ❌ Error: No projectId provided");
      throw new Error('Project ID must be provided');
    }
    
    console.log(`[BOT SETTINGS] 🔍 Fetching bot settings for project ${projectId}`);
    
    // Build the query based on provided parameters
    const query = supabase
      .from('telegram_bot_settings')
      .select('*, use_custom_bot, custom_bot_token')
      .eq('project_id', projectId);
    
    // Execute query
    const { data: settings, error } = await query.single();

    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error fetching bot settings for project ${projectId}:`, error);
      
      // If settings don't exist, we should consider creating default settings
      // This is handled by the trigger in the database, but we'll log it here
      if (error.code === 'PGRST116') {
        console.log(`[BOT SETTINGS] ⚠️ Bot settings not found for project ${projectId}`);
      }
      
      throw error;
    }

    console.log(`[BOT SETTINGS] ✅ Successfully retrieved bot settings for project ${projectId}`);
    return settings;
  } catch (error) {
    console.error('[BOT SETTINGS] ❌ Error in getBotSettings:', error);
    throw error;
  }
}

export async function updateBotSettings(
  supabase: ReturnType<typeof createClient>, 
  settings: Record<string, any>, 
  projectId: string
) {
  try {
    // Input validation
    if (!projectId) {
      console.error("[BOT SETTINGS] ❌ Error: No projectId provided for update");
      throw new Error('Project ID must be provided for update');
    }
    
    console.log(`[BOT SETTINGS] 🔄 Updating bot settings for project ${projectId}`);
    
    // Build the query based on provided parameters
    const query = supabase
      .from('telegram_bot_settings')
      .update(settings)
      .eq('project_id', projectId);
    
    // Execute query with returning set to minimal to reduce payload size
    const { data, error } = await query.select('id').single();

    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error updating bot settings for project ${projectId}:`, error);
      throw error;
    }

    console.log(`[BOT SETTINGS] ✅ Successfully updated bot settings for project ${projectId}`);
    return data;
  } catch (error) {
    console.error('[BOT SETTINGS] ❌ Error in updateBotSettings:', error);
    throw error;
  }
}

export async function getBotToken(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  defaultBotToken: string
): Promise<string> {
  try {
    // Get bot settings for this project
    const { data, error } = await supabase
      .from('telegram_bot_settings')
      .select('use_custom_bot, custom_bot_token')
      .eq('project_id', projectId)
      .single();
    
    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error fetching bot token:`, error);
      // Fallback to default bot
      return defaultBotToken;
    }
    
    // If custom bot is enabled and token is available, use it
    if (data?.use_custom_bot && data?.custom_bot_token) {
      console.log(`[BOT SETTINGS] 🔑 Using custom bot token for project ${projectId}`);
      return data.custom_bot_token;
    }
    
    // Otherwise use default bot
    console.log(`[BOT SETTINGS] 🔑 Using default bot token for project ${projectId}`);
    return defaultBotToken;
  } catch (error) {
    console.error(`[BOT SETTINGS] ❌ Error getting bot token:`, error);
    // Fallback to default bot in case of any error
    return defaultBotToken;
  }
}
