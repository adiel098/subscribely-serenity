
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseTelegramChannelInfoProps {
  communityId?: string | null;
  telegramChatId?: string | null;
  autoUpdate?: boolean;
}

export const useTelegramChannelInfo = ({ 
  communityId, 
  telegramChatId,
  autoUpdate = true
}: UseTelegramChannelInfoProps) => {
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If we don't have a chat ID, we can't fetch channel info
    if (!telegramChatId) {
      console.log("[useTelegramChannelInfo] No Telegram chat ID provided, cannot fetch channel info");
      return;
    }

    const fetchChannelInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[useTelegramChannelInfo] Fetching info for chat ${telegramChatId}, community ${communityId || 'Not provided'}`);

        const requestPayload = { 
          communityId, 
          chatId: telegramChatId,
          autoUpdate
        };
        
        console.log("[useTelegramChannelInfo] Request payload:", JSON.stringify(requestPayload, null, 2));

        const { data, error } = await supabase.functions.invoke("get-telegram-channel-info", {
          body: requestPayload
        });

        console.log("[useTelegramChannelInfo] Edge function response:", JSON.stringify(data, null, 2));
        
        if (error) {
          console.error("[useTelegramChannelInfo] Error from edge function:", error);
          setError(error.message || "Failed to fetch channel info from Telegram");
          
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch community information"
          });
          
          return;
        }

        if (data?.description) {
          console.log("[useTelegramChannelInfo] Successfully fetched description:", data.description);
          setDescription(data.description);
        } else {
          console.log("[useTelegramChannelInfo] No description available for this channel");
          setDescription(null);
        }
      } catch (err) {
        console.error("[useTelegramChannelInfo] Unexpected error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelInfo();
  }, [telegramChatId, communityId, autoUpdate, toast]);

  return { description, loading, error };
};
