
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { findCommunityById } from '../../communityHandler.ts';
import { getBotSettings } from '../../botSettingsHandler.ts';

/**
 * Fetches all required data for handling start command
 */
export async function fetchStartCommandData(
  supabase: ReturnType<typeof createClient>,
  communityId: string
) {
  console.log('[DataSources] Fetching community and bot settings...');
  
  try {
    const [community, botSettings] = await Promise.all([
      findCommunityById(supabase, communityId),
      getBotSettings(supabase, communityId)
    ]);

    if (!community) {
      console.log('[DataSources] Community not found:', communityId);
      return { success: false, error: 'Community not found' };
    }

    if (!botSettings) {
      console.log('[DataSources] Bot settings not found for community:', communityId);
      return { success: false, error: 'Bot settings not found' };
    }

    console.log('[DataSources] Found community and settings:', { 
      communityName: community.name,
      hasWelcomeMessage: !!botSettings.welcome_message,
      hasWelcomeImage: !!botSettings.welcome_image
    });

    return {
      success: true,
      community,
      botSettings
    };
  } catch (error) {
    console.error('[DataSources] Error fetching start command data:', error);
    return { success: false, error: 'Error fetching data' };
  }
}
