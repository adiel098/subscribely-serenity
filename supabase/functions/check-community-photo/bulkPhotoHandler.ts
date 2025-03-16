
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { fetchCommunityPhoto } from './photoFetcher.ts';

// Type for community data passed to bulk handler
interface CommunityData {
  id: string;
  telegramChatId: string;
}

// Function to handle bulk photo fetching
export async function handleBulkPhotoFetch(
  communities: CommunityData[], 
  botToken: string, 
  supabase: ReturnType<typeof createClient>
) {
  console.log(`Processing batch of ${communities.length} communities`);
  
  const results: Record<string, string> = {};
  const errors: Array<{communityId: string, error: string}> = [];
  let successCount = 0;
  
  for (const community of communities) {
    try {
      if (!community.id || !community.telegramChatId) {
        console.warn('Skipping community with missing data:', community);
        continue;
      }
      
      const photoUrl = await fetchCommunityPhoto(
        community.telegramChatId, 
        botToken, 
        community.id, 
        supabase, 
        false
      );
      
      if (photoUrl) {
        results[community.id] = photoUrl;
        successCount++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Error fetching photo for community ${community.id}:`, err);
      errors.push({ communityId: community.id, error: errorMessage });
    }
  }
  
  console.log(`Fetched ${successCount} photos successfully, ${errors.length} errors`);
  
  return new Response(
    JSON.stringify({ 
      results, 
      errors: errors.length ? errors : undefined,
      message: `Fetched ${successCount} of ${communities.length} community photos` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
