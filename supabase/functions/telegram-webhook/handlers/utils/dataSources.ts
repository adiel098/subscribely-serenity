
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
    
    // Fetch community data and bot settings in parallel
    const [communityResult, botSettingsResult] = await Promise.all([
      supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single(),
      
      supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('community_id', communityId)
        .single()
    ]);
    
    // Handle errors in fetching community
    if (communityResult.error) {
      console.error('[DATA-SOURCES] ❌ Error fetching community:', communityResult.error);
      return {
        success: false,
        error: `Community not found: ${communityResult.error.message}`
      };
    }
    
    // Handle errors in fetching bot settings
    if (botSettingsResult.error) {
      console.error('[DATA-SOURCES] ❌ Error fetching bot settings:', botSettingsResult.error);
      return {
        success: false,
        error: `Bot settings not found: ${botSettingsResult.error.message}`
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
