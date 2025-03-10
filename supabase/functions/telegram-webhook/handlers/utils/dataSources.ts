
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../services/loggingService.ts';

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
  communityIdOrLink: string
): Promise<StartCommandDataResult> {
  const logger = createLogger(supabase, 'DATA-SOURCES');
  
  try {
    await logger.info(`Fetching data for community ID or link: ${communityIdOrLink}`);
    
    // Check if it's a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityIdOrLink);
    let communityId = communityIdOrLink;
    
    if (!isUUID) {
      await logger.info(`Input appears to be a custom link: ${communityIdOrLink}`);
      
      // Fetch community by custom_link
      const { data: communityData, error: linkError } = await supabase
        .from('communities')
        .select('id')
        .eq('custom_link', communityIdOrLink)
        .single();
      
      if (linkError || !communityData) {
        await logger.error(`Failed to find community with custom link: ${communityIdOrLink}`, linkError);
        return {
          success: false,
          error: `Community not found with custom link: ${communityIdOrLink}`
        };
      }
      
      communityId = communityData.id;
      await logger.info(`Custom link ${communityIdOrLink} resolved to community ID: ${communityId}`);
    }
    
    // Now fetch community data by ID
    const communityResult = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();
    
    // Handle errors in fetching community
    if (communityResult.error) {
      await logger.error('Error fetching community:', communityResult.error);
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
    
    // If bot settings don't exist, we'll use a default settings object but won't try to save it
    // This avoids RLS issues when creating new records
    if (botSettingsResult.error || !botSettingsResult.data) {
      await logger.warn('Bot settings not found, using default settings');
      
      // Create default bot settings object (but don't insert to database)
      const defaultBotSettings = {
        community_id: communityId,
        welcome_message: `Welcome to ${communityResult.data.name}! 🎉\n\nTo access this community, you need to purchase a subscription.`,
        auto_welcome_message: true,
        auto_remove_expired: false,
        language: 'en',
        bot_signature: '🤖 MembershipBot'
      };
      
      // Log that we're using default settings
      await logger.info('Using default bot settings without database insertion');
      
      // Return success with community data and default settings
      return {
        success: true,
        community: communityResult.data,
        botSettings: defaultBotSettings
      };
    }
    
    await logger.success('Successfully fetched community and bot settings');
    
    return {
      success: true,
      community: communityResult.data,
      botSettings: botSettingsResult.data
    };
  } catch (error) {
    await logger.error('Exception in fetchStartCommandData:', error);
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
  const logger = createLogger(supabase, 'DATA-SOURCES');
  
  try {
    await logger.info(`Fetching community with plans for ID: ${communityId}`);
    
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        subscription_plans:subscription_plans(*)
      `)
      .eq('id', communityId)
      .single();
    
    if (error) {
      await logger.error('Error fetching community with plans:', error);
      throw error;
    }
    
    await logger.success('Successfully fetched community with plans');
    return data;
  } catch (error) {
    await logger.error('Exception in fetchCommunityWithPlans:', error);
    throw error;
  }
}
