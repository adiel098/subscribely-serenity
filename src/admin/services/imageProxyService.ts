
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a proxied URL for Telegram images that require authentication
 * 
 * @param photoUrl The original Telegram photo URL
 * @returns A proxied URL that can be used in img tags
 */
export function getProxiedImageUrl(photoUrl: string | null): string | null {
  if (!photoUrl) return null;
  
  // Check if this is a Telegram URL that needs proxying
  if (photoUrl.includes('telegram.org') || photoUrl.includes('t.me')) {
    // Construct the proxy URL using the correct method
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-image-proxy?url=${encodeURIComponent(photoUrl)}`;
    console.log(`Proxying image: ${photoUrl} -> ${functionUrl}`);
    return functionUrl;
  }
  
  // Return the original URL if it doesn't need proxying
  return photoUrl;
}
