
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Community, TelegramUser } from "../types/app.types";

interface UseCommunityDataProps {
  startParam: string | null;
  initData: string | null;
}

export const useCommunityData = ({ startParam, initData }: UseCommunityDataProps) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        console.log('Fetching community data with params:', { 
          startParam, 
          initData: initData ? `${initData.substring(0, 20)}...` : null 
        });
        
        // Make sure there's data to send
        if (!startParam) {
          console.error("No start parameter provided");
          setError("Missing community ID");
          setLoading(false);
          return;
        }
        
        // Prepare payload for the Edge Function
        const payload = { 
          start: startParam,
          initData 
        };
        
        console.log('Sending payload to telegram-mini-app function:', payload);
        
        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: payload
        });

        console.log('Full response from telegram-mini-app function:', response);

        if (response.error) {
          console.error("Error from function:", response.error);
          setError(response.error.message || "Error fetching community data");
          throw new Error(response.error.message || "Error fetching community data");
        }

        if (response.data?.community) {
          console.log("Community data received:", response.data.community);
          setCommunity(response.data.community);
          
          // Extract user data if available
          if (response.data.user) {
            const userData = response.data.user;
            console.log("User data from function:", userData);
            
            if (userData && userData.id) {
              setTelegramUser({
                id: userData.id,
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                username: userData.username || "",
                photo_url: userData.photo_url || "",
                email: userData.email
              });
            } else {
              console.warn("User data missing required fields:", userData);
            }
          } else {
            console.warn("No user data returned from function");
            // We still want to proceed even without user data
            // This allows the app to work in non-Telegram environments for testing
          }
        } else {
          console.error("No community data returned from function");
          setError("Community not found");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
        setError("Failed to load data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load community data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [startParam, initData, toast]);

  return { loading, community, telegramUser, error, setTelegramUser };
};
