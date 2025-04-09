
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './services/loggingService.ts';

/**
 * Find community by ID (UUID) or custom link with improved error handling
 */
export async function findCommunityByIdOrLink(supabase: ReturnType<typeof createClient>, communityIdOrLink: string) {
  const logger = createLogger(supabase, 'COMMUNITY-DB-UTILS');
  
  try {
    await logger.info(`🔍 Looking up community by ID or link: ${communityIdOrLink}`);
    
    // First, check if it matches a UUID pattern
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityIdOrLink);
    
    if (isUUID) {
      // If it looks like a UUID, first try to find by ID
      await logger.info(`🔗 Input appears to be a UUID: ${communityIdOrLink}`);
      
      try {
        const { data: community, error } = await supabase
          .from('communities')
          .select('*')
          .eq('id', communityIdOrLink)
          .single();
          
        if (error) {
          await logger.error(`❌ Error querying communities:`, error);
        } else if (community) {
          await logger.success(`✅ Found community by ID: ${community.name}`);
          return community;
        }
      } catch (error) {
        await logger.error(`❌ Error in UUID lookup:`, error);
      }
    }
    
    // If not found by ID or not a UUID, try custom link
    await logger.info(`🔗 Input appears to be a custom link: ${communityIdOrLink}`);
    
    try {
      const { data: communityByLink, error } = await supabase
        .from('communities')
        .select('*')
        .eq('custom_link', communityIdOrLink)
        .single();
        
      if (error) {
        await logger.error(`❌ Error querying communities:`, error);
      } else if (communityByLink) {
        await logger.success(`✅ Found community by custom link: ${communityByLink.name}`);
        return communityByLink;
      }
    } catch (error) {
      await logger.error(`❌ Error in custom link lookup:`, error);
    }
    
    await logger.warn(`⚠️ Community not found with identifier: ${communityIdOrLink}`);
    return null;
  } catch (error) {
    await logger.error(`❌ Error in findCommunityByIdOrLink:`, error);
    return null;
  }
}
