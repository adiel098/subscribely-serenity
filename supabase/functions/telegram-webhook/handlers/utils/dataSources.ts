
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Function to fetch data needed for the start command
export async function fetchStartCommandData(
  supabase: ReturnType<typeof createClient>,
  communityId: string
) {
  try {
    console.log('[DataSources] Fetching data for communityId:', communityId);
    
    // Get community data
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();
      
    if (communityError) {
      console.error('[DataSources] Error fetching community:', communityError);
      return { 
        success: false, 
        error: `Failed to fetch community: ${communityError.message}` 
      };
    }
    
    if (!community) {
      console.error('[DataSources] Community not found:', communityId);
      return { 
        success: false, 
        error: 'Community not found' 
      };
    }
    
    console.log('[DataSources] Community found:', { 
      name: community.name, 
      id: community.id 
    });
    
    // Get bot settings
    const { data: botSettings, error: settingsError } = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('community_id', communityId)
      .single();
      
    if (settingsError) {
      console.error('[DataSources] Error fetching bot settings:', settingsError);
      return { 
        success: false, 
        error: `Failed to fetch bot settings: ${settingsError.message}` 
      };
    }

    console.log('[DataSources] Bot settings retrieved:', { 
      hasWelcomeMessage: !!botSettings.welcome_message,
      hasWelcomeImage: !!botSettings.welcome_image
    });
    
    return {
      success: true,
      community,
      botSettings
    };
  } catch (error) {
    console.error('[DataSources] Error in fetchStartCommandData:', error);
    return { 
      success: false, 
      error: `General error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
