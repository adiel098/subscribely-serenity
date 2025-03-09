
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface StartCommandDataResult {
  success: boolean;
  community?: any;
  botSettings?: any;
  error?: string;
}

/**
 * Fetch data needed for processing the start command
 */
export async function fetchStartCommandData(
  supabase: ReturnType<typeof createClient>,
  communityId: string
): Promise<StartCommandDataResult> {
  try {
    console.log(`[DATA-SOURCES] 🔍 Fetching data for community ID: ${communityId}`);
    
    // Fetch community data first
    const communityResult = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();
    
    // Handle errors in fetching community
    if (communityResult.error) {
      console.error('[DATA-SOURCES] ❌ Error fetching community:', communityResult.error);
      return {
        success: false,
        error: `Community not found: ${communityResult.error.message}`
      };
    }
    
    // Now fetch bot settings, but handle the case when they don't exist
    const botSettingsResult = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('community_id', communityId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle missing bot settings
    
    // If bot settings don't exist, we'll automatically create default settings
    if (botSettingsResult.error || !botSettingsResult.data) {
      console.log('[DATA-SOURCES] ⚠️ Bot settings not found, creating default settings');
      
      // Create default bot settings
      const defaultBotSettings = {
        community_id: communityId,
        welcome_message: `Welcome to ${communityResult.data.name}! 🎉\n\nTo access this community, you need to purchase a subscription.`,
        auto_welcome_message: true,
        auto_remove_expired: false,
        language: 'en',
        bot_signature: '🤖 MembershipBot'
      };
      
      const createResult = await supabase
        .from('telegram_bot_settings')
        .insert(defaultBotSettings)
        .select()
        .single();
        
      if (createResult.error) {
        console.error('[DATA-SOURCES] ❌ Error creating default bot settings:', createResult.error);
        // Continue with community data only
        return {
          success: true,
          community: communityResult.data,
          botSettings: defaultBotSettings,
          error: 'Using default bot settings (failed to save)'
        };
      }
      
      console.log('[DATA-SOURCES] ✅ Default bot settings created successfully');
      
      return {
        success: true,
        community: communityResult.data,
        botSettings: createResult.data
      };
    }
    
    console.log('[DATA-SOURCES] ✅ Successfully fetched community and bot settings');
    
    return {
      success: true,
      community: communityResult.data,
      botSettings: botSettingsResult.data
    };
  } catch (error) {
    console.error('[DATA-SOURCES] ❌ Exception in fetchStartCommandData:', error);
    return {
      success: false,
      error: `Error fetching data: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Fetch community and subscription plans
 */
export async function fetchCommunityWithPlans(
  supabase: ReturnType<typeof createClient>,
  communityId: string
): Promise<any> {
  try {
    console.log(`[DATA-SOURCES] 🔍 Fetching community with plans for ID: ${communityId}`);
    
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        subscription_plans:subscription_plans(*)
      `)
      .eq('id', communityId)
      .single();
    
    if (error) {
      console.error('[DATA-SOURCES] ❌ Error fetching community with plans:', error);
      throw error;
    }
    
    console.log('[DATA-SOURCES] ✅ Successfully fetched community with plans');
    return data;
  } catch (error) {
    console.error('[DATA-SOURCES] ❌ Exception in fetchCommunityWithPlans:', error);
    throw error;
  }
}
