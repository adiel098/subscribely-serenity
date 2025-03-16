import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './services/loggingService.ts';

/**
 * Find community by ID (UUID)
 */
export async function findCommunityById(supabase: ReturnType<typeof createClient>, communityId: string) {
  const logger = createLogger(supabase, 'COMMUNITY-HANDLER');
  
  try {
    await logger.info(`🔍 Looking up community by ID: ${communityId}`);
    
    // Check if it's a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityId);
    if (!isUUID) {
      await logger.warn(`⚠️ Invalid UUID format: ${communityId}`);
      return null;
    }
    
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (error) {
      await logger.error(`❌ Error fetching community by ID: ${communityId}`, error);
      return null;
    }

    await logger.success(`✅ Found community by ID: ${community?.name || 'Unknown'}`);
    return community;
  } catch (error) {
    await logger.error(`❌ Error in findCommunityById for ID: ${communityId}`, error);
    return null;
  }
}

/**
 * Find community by custom link
 */
export async function findCommunityByCustomLink(supabase: ReturnType<typeof createClient>, customLink: string) {
  const logger = createLogger(supabase, 'COMMUNITY-HANDLER');
  
  try {
    await logger.info(`🔍 Looking up community by custom link: ${customLink}`);
    
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('custom_link', customLink)
      .single();

    if (error) {
      await logger.error(`❌ Error fetching community by custom link: ${customLink}`, error);
      return null;
    }

    if (community) {
      await logger.success(`✅ Found community by custom link: ${customLink}, ID: ${community.id}, Name: ${community.name}`);
    } else {
      await logger.warn(`⚠️ No community found with custom link: ${customLink}`);
    }
    
    return community;
  } catch (error) {
    await logger.error(`❌ Error in findCommunityByCustomLink for link: ${customLink}`, error);
    return null;
  }
}

/**
 * Find community by either ID or custom link
 */
export async function findCommunityByIdOrLink(supabase: ReturnType<typeof createClient>, idOrLink: string) {
  const logger = createLogger(supabase, 'COMMUNITY-HANDLER');
  
  // Check if it's a UUID first
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
  
  await logger.info(`🔍 Checking if '${idOrLink}' is UUID: ${isUUID}`);
  
  if (isUUID) {
    return findCommunityById(supabase, idOrLink);
  }
  
  // Otherwise, try to find by custom link
  await logger.info(`🔍 Looking up as custom link: ${idOrLink}`);
  const community = await findCommunityByCustomLink(supabase, idOrLink);
  
  if (!community) {
    await logger.warn(`⚠️ No community found for ID or link: ${idOrLink}`);
  }
  
  return community;
}
