
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseTelegramChatPhotoProps {
  communityId?: string | null;
  telegramChatId?: string | null;
  existingPhotoUrl?: string | null;
}

export const useTelegramChatPhoto = ({ 
  communityId, 
  telegramChatId,
  existingPhotoUrl 
}: UseTelegramChatPhotoProps) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(existingPhotoUrl || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If we already have a photo URL, don't fetch a new one
    if (existingPhotoUrl) {
      console.log("[useTelegramChatPhoto] Using existing photo URL:", existingPhotoUrl);
      setPhotoUrl(existingPhotoUrl);
      return;
    }
    
    // If we don't have a chat ID, we can't fetch a photo
    if (!telegramChatId) {
      console.log("[useTelegramChatPhoto] No Telegram chat ID provided, cannot fetch photo");
      return;
    }

    const fetchChatPhoto = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[useTelegramChatPhoto] Starting fetch for chat ${telegramChatId}, community ${communityId || 'Not provided'}`);

        const requestPayload = { 
          communityId, 
          telegramChatId 
        };
        console.log("[useTelegramChatPhoto] Request payload:", JSON.stringify(requestPayload, null, 2));

        const { data, error } = await supabase.functions.invoke("get-telegram-chat-photo", {
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
  }, [telegramChatId, communityId, existingPhotoUrl, toast]);

  return { photoUrl, loading, error };
};
