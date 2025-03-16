
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';

// Function to check if a photo is fresh enough to use
export function isPhotoCacheFresh(updateTimestamp: string | null): boolean {
  if (!updateTimestamp) return false;
  
  const photoAge = new Date().getTime() - new Date(updateTimestamp).getTime();
  const photoAgeHours = photoAge / (1000 * 60 * 60);
  
  // Cache is valid for 24 hours
  return photoAgeHours < 24;
}

// Fetch photo for a single community
export async function fetchCommunityPhoto(
  chatId: string, 
  botToken: string, 
  communityId: string, 
  supabase: ReturnType<typeof createClient>, 
  forceFetch = false
) {
  try {
    console.log(`Fetching photo for chat ${chatId}, force=${forceFetch}`);
    
    // Check if we have a cached photo URL and are not forcing a refresh
    if (!forceFetch) {
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_photo_url, updated_at')
        .eq('id', communityId)
        .single();
      
      if (communityError) {
        console.error('Error fetching community data:', communityError);
      } else if (community?.telegram_photo_url && isPhotoCacheFresh(community.updated_at)) {
        console.log(`Using cached photo URL, age: ${isPhotoCacheFresh(community.updated_at)}`);
        return community.telegram_photo_url;
      }
    }
    
    // Make sure chat ID is properly formatted
    const formattedChatId = chatId.toString().trim();
    console.log(`Requesting photo from Telegram API for chat: ${formattedChatId}`);
    
    const photoUrl = await fetchPhotoFromTelegram(formattedChatId, botToken);
    
    if (photoUrl) {
      // Update the community with the new photo URL
      const { error: updateError } = await supabase
        .from('communities')
        .update({ telegram_photo_url: photoUrl })
        .eq('id', communityId);
      
      if (updateError) {
        console.error('Failed to update community with photo URL:', updateError);
      } else {
        console.log('Successfully updated community with new photo URL');
      }
    }
    
    return photoUrl;
  } catch (error) {
    console.error(`Error fetching photo for chat ${chatId}:`, error);
    throw error;
  }
}

// Helper function to communicate with Telegram API
async function fetchPhotoFromTelegram(chatId: string, botToken: string): Promise<string | null> {
  try {
    // Fetch chat photo from Telegram
    const apiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });
    
    // Log detailed response information for debugging
    console.log(`Telegram API response status: ${response.status}`);
    const responseText = await response.text();
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Telegram API response:', e);
      throw new Error(`Invalid response from Telegram API: ${responseText.substring(0, 100)}`);
    }
    
    // Check for API errors
    if (!data.ok) {
      console.error('Telegram API error:', data.description || 'Unknown error');
      throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
    }
    
    // Check if chat has a photo
    if (!data.result?.photo) {
      console.log('No photo available for this chat');
      return null;
    }
    
    // Get photo file ID
    const photoFileId = data.result.photo.big_file_id || data.result.photo.small_file_id;
    if (!photoFileId) {
      console.log('No photo file ID available');
      return null;
    }
    
    // Get file path for the photo
    const filePathResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: photoFileId })
    });
    
    const filePathData = await filePathResponse.json();
    
    if (!filePathData.ok || !filePathData.result?.file_path) {
      console.error('Failed to get file path:', filePathData);
      throw new Error('Failed to get photo file path');
    }
    
    // Construct photo URL
    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${filePathData.result.file_path}`;
    console.log('Photo URL generated:', photoUrl.substring(0, 60) + '...');
    
    return photoUrl;
  } catch (error) {
    console.error('Error in fetchPhotoFromTelegram:', error);
    return null;
  }
}
