
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { fetchCommunityPhoto } from './photoFetcher.ts';

/**
 * Handle bulk photo fetching for multiple communities
 */
export async function handleBulkPhotoFetch(
  communities: { id: string; telegramChatId: string | null }[],
  botToken: string,
  supabase: ReturnType<typeof createClient>
) {
  try {
    console.log(`Processing bulk photo fetch for ${communities.length} communities`);
    
    // Filter out communities without a Telegram chat ID
    const validCommunities = communities.filter(c => c.id && c.telegramChatId);
    console.log(`Found ${validCommunities.length} communities with valid Telegram chat IDs`);
    
    if (validCommunities.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No communities with Telegram chat IDs provided', 
          results: {} 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process each community in parallel
    const results: Record<string, string> = {};
    const errors: { communityId: string; error: string }[] = [];
    
    await Promise.all(validCommunities.map(async (community) => {
      try {
        console.log(`Fetching photo for community ${community.id}, chat ID ${community.telegramChatId}`);
        const photoUrl = await fetchCommunityPhoto(
          community.telegramChatId!,
          botToken,
          community.id,
          supabase,
          true // Force fetch to ensure we get fresh photos
        );
        
        if (photoUrl) {
          results[community.id] = photoUrl;
          console.log(`Successfully fetched photo for community ${community.id}`);
        } else {
          console.log(`No photo available for community ${community.id}`);
        }
      } catch (error) {
        console.error(`Error fetching photo for community ${community.id}:`, error);
        errors.push({ communityId: community.id, error: error.message || 'Unknown error' });
      }
    }));
    
    console.log(`Completed bulk photo fetch. Success: ${Object.keys(results).length}, Errors: ${errors.length}`);
    
    return new Response(
      JSON.stringify({ 
        results,
        errors,
        processedCount: validCommunities.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bulk photo fetch:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
