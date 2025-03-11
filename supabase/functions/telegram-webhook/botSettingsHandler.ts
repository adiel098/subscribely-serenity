
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getBotSettings(supabase: ReturnType<typeof createClient>, communityId: string | null, groupId: string | null = null) {
  try {
    // Input validation
    if (!communityId && !groupId) {
      console.error("[BOT SETTINGS] ❌ Error: Neither communityId nor groupId provided");
      throw new Error('Either communityId or groupId must be provided');
    }
    
    console.log(`[BOT SETTINGS] 🔍 Fetching bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}`);
    
    // Build the query based on provided parameters
    let query = supabase
      .from('telegram_bot_settings')
      .select('*');
    
    if (communityId) {
      query = query.eq('community_id', communityId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    // Execute query
    const { data: settings, error } = await query.single();

    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error fetching bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}:`, error);
      
      // If settings don't exist, we should consider creating default settings
      // This is handled by the trigger in the database, but we'll log it here
      if (error.code === 'PGRST116') {
        console.log(`[BOT SETTINGS] ⚠️ Bot settings not found for ${communityId ? 'community' : 'group'} ${communityId || groupId}`);
      }
      
      throw error;
    }

    console.log(`[BOT SETTINGS] ✅ Successfully retrieved bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}`);
    return settings;
  } catch (error) {
    console.error('[BOT SETTINGS] ❌ Error in getBotSettings:', error);
    throw error;
  }
}

export async function updateBotSettings(
  supabase: ReturnType<typeof createClient>, 
  settings: Record<string, any>, 
  communityId: string | null, 
  groupId: string | null = null
) {
  try {
    // Input validation
    if (!communityId && !groupId) {
      console.error("[BOT SETTINGS] ❌ Error: Neither communityId nor groupId provided for update");
      throw new Error('Either communityId or groupId must be provided for update');
    }
    
    console.log(`[BOT SETTINGS] 🔄 Updating bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}`);
    
    // Build the query based on provided parameters
    let query = supabase
      .from('telegram_bot_settings')
      .update(settings);
    
    if (communityId) {
      query = query.eq('community_id', communityId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    // Execute query with returning set to minimal to reduce payload size
    const { data, error } = await query.select('id').single();

    if (error) {
      console.error(`[BOT SETTINGS] ❌ Error updating bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}:`, error);
      throw error;
    }

    console.log(`[BOT SETTINGS] ✅ Successfully updated bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}`);
    return data;
  } catch (error) {
    console.error('[BOT SETTINGS] ❌ Error in updateBotSettings:', error);
    throw error;
  }
}
