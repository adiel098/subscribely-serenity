
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
      console.log("[useTelegramChatPhoto] No Telegram chat ID provided");
      return;
    }

    const fetchChatPhoto = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[useTelegramChatPhoto] Fetching photo for chat ${telegramChatId}`);

        const { data, error } = await supabase.functions.invoke("get-telegram-chat-photo", {
          body: { 
            communityId, 
            telegramChatId 
          }
        });

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
