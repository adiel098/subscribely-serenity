
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './services/loggingService.ts';

/**
 * Find community by ID (UUID) or custom link with improved error handling
 */
export async function findCommunityByIdOrLink(supabase: ReturnType<typeof createClient>, communityIdOrLink: string) {
  const logger = createLogger(supabase, 'COMMUNITY-HANDLER');
  
  try {
    await logger.info(`🔍 Looking up community by ID or link: ${communityIdOrLink}`);
    
    // Check if it's a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityIdOrLink);
    
    // Try to find by ID if it looks like a UUID
    if (isUUID) {
      await logger.info(`🔍 Identifier appears to be a UUID, searching by ID`);
      
      const { data: community, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityIdOrLink)
        .single();

      if (error) {
        await logger.error(`❌ Error fetching community by ID: ${communityIdOrLink}`, error);
        // Continue to try the custom_link approach
      } else if (community) {
        await logger.success(`✅ Found community by ID: ${community.name} (${community.id})`);
        return community;
      }
    }
    
    // Try to find by custom link
    await logger.info(`🔍 Searching by custom link: ${communityIdOrLink}`);
    
    const { data: communityByLink, error: linkError } = await supabase
      .from('communities')
      .select('*')
      .eq('custom_link', communityIdOrLink)
      .single();

    if (linkError) {
      await logger.error(`❌ Error fetching community by custom link: ${communityIdOrLink}`, linkError);
      return null;
    }

    if (communityByLink) {
      await logger.success(`✅ Found community by custom link: ${communityByLink.name} (${communityByLink.id})`);
      return communityByLink;
    }
    
    await logger.warn(`⚠️ No community found with ID or link: ${communityIdOrLink}`);
    return null;
  } catch (error) {
    await logger.error(`❌ Error in findCommunityByIdOrLink: ${error.message}`, error);
    return null;
  }
}
