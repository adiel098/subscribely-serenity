
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseTelegramChatPhotoProps {
  communityId?: string | null;
  telegramChatId?: string | null;
  existingPhotoUrl?: string | null;
  forceFetch?: boolean;
}

export const useTelegramChatPhoto = ({ 
  communityId, 
  telegramChatId,
  existingPhotoUrl,
  forceFetch = false
}: UseTelegramChatPhotoProps) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(existingPhotoUrl || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("[useTelegramChatPhoto] Starting with params:", { 
      communityId, 
      telegramChatId, 
      existingPhotoUrl,
      forceFetch
    });
    
    // If we don't have a chat ID, we can't fetch a photo
    if (!telegramChatId) {
      console.log("[useTelegramChatPhoto] No Telegram chat ID provided, cannot fetch photo");
      return;
    }

    const fetchChatPhoto = async () => {
      try {
        // Always set loading to true to show we're attempting to fetch
        setLoading(true);
        setError(null);
        
        console.log(`[useTelegramChatPhoto] Fetching photo for chat ${telegramChatId}, community ${communityId || 'Not provided'}`);

        // If we already have a photo URL and it's valid and we're not forcing a fetch, we can use it
        if (existingPhotoUrl && !forceFetch) {
          console.log("[useTelegramChatPhoto] Checking existing photo URL:", existingPhotoUrl);
          try {
            // Test if the existing photo URL is accessible
            const photoTest = await fetch(existingPhotoUrl, { method: 'HEAD' });
            if (photoTest.ok) {
              console.log("[useTelegramChatPhoto] Existing photo URL is valid, using it");
              setPhotoUrl(existingPhotoUrl);
              setLoading(false);
              return;
            } else {
              console.log("[useTelegramChatPhoto] Existing photo URL is invalid, will fetch from Telegram");
            }
          } catch (e) {
            console.log("[useTelegramChatPhoto] Error testing existing photo URL, will fetch from Telegram:", e);
          }
        }

        // Always attempt to fetch from Telegram if we reach this point
        const requestPayload = { 
          communityId, 
          telegramChatId,
          forceFetch: true // Add a flag to force fetch even if photo exists in DB
        };
        console.log("[useTelegramChatPhoto] Request payload:", JSON.stringify(requestPayload, null, 2));

        const { data, error } = await supabase.functions.invoke("check-community-photo", {
          body: requestPayload
        });

        console.log("[useTelegramChatPhoto] Edge function response:", JSON.stringify(data, null, 2));
        
        if (error) {
          console.error("[useTelegramChatPhoto] Error from edge function:", error);
          setError(error.message || "Failed to fetch photo from Telegram");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch community photo"
          });
          return;
        }

        if (data?.photoUrl) {
          console.log("[useTelegramChatPhoto] Successfully fetched photo URL:", data.photoUrl);
          setPhotoUrl(data.photoUrl);
        } else {
          console.log("[useTelegramChatPhoto] No photo available for this chat");
          // If we have chat data but no photo, log what we did receive
          if (data?.chatData) {
            console.log("[useTelegramChatPhoto] Chat data received:", JSON.stringify(data.chatData, null, 2));
          }
        }
      } catch (err) {
        console.error("[useTelegramChatPhoto] Unexpected error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChatPhoto();
  }, [telegramChatId, communityId, existingPhotoUrl, forceFetch, toast]);

  return { photoUrl, loading, error };
};
