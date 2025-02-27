
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
          setLoading(false);
          return;
        }
        
        const response = await supabase.functions.invoke("telegram-mini-app", {
          body: { 
            start: startParam,
            initData 
          }
        });

        console.log('Response from telegram-mini-app function:', response);

        if (response.error) {
          console.error("Error from function:", response.error);
          throw new Error(response.error.message || "Error fetching community data");
        }

        if (response.data?.community) {
          setCommunity(response.data.community);
          
          // Extract user data if available
          if (response.data.user) {
            const userData = response.data.user;
            console.log("User data from function:", userData);
            setTelegramUser({
              id: userData.id,
              first_name: userData.first_name || "",
              last_name: userData.last_name || "",
              username: userData.username || "",
              photo_url: userData.photo_url || ""
            });
          } else {
            console.warn("No user data returned from function");
          }
        } else {
          console.error("No community data returned from function");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
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

  return { loading, community, telegramUser, setTelegramUser };
};
