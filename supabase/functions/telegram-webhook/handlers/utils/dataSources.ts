
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
    let communityQuery;
    
    if (isUUID) {
      // If it's a UUID, search by ID
      communityQuery = supabase
        .from('communities')
        .select('*')
        .eq('id', communityIdOrLink);
    } else {
      // If it's not a UUID, search by custom_link
      communityQuery = supabase
        .from('communities')
        .select('*')
        .eq('custom_link', communityIdOrLink);
    }
    
    // Execute the query
    const { data: communities, error: communityError } = await communityQuery;
    
    if (communityError) {
      await logger.error('Error fetching community:', communityError);
      return {
        success: false,
        error: `Community not found: ${communityError.message}`
      };
    }
    
    if (!communities || communities.length === 0) {
      await logger.error(`No community found with identifier: ${communityIdOrLink}`);
      return {
        success: false,
        error: `No community found with identifier: ${communityIdOrLink}`
      };
    }
    
    // Get the first matching community
    const community = communities[0];
    await logger.info(`Found community: ${community.name} (ID: ${community.id})`);
    
    // Now fetch bot settings, but handle the case when they don't exist
    const botSettingsResult = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('community_id', community.id)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle missing bot settings
    
    // If bot settings don't exist, we'll use a default settings object but won't try to save it
    // This avoids RLS issues when creating new records
    if (botSettingsResult.error || !botSettingsResult.data) {
      await logger.warn('Bot settings not found, using default settings');
      
      // Create default bot settings object (but don't insert to database)
      const defaultBotSettings = {
        community_id: community.id,
        welcome_message: `Welcome to ${community.name}! 🎉\n\nTo access this community, you need to purchase a subscription.`,
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
        community: community,
        botSettings: defaultBotSettings
      };
    }
    
    await logger.success('Successfully fetched community and bot settings');
    
    return {
      success: true,
      community: community,
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
