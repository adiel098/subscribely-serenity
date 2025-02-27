
import { useState, useEffect } from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCommunityData = (communityId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        if (!communityId) {
          throw new Error("No community ID provided");
        }
        
        console.log('Fetching community data with ID:', communityId);
        
        const response = await supabase.functions.invoke("telegram-community-data", {
          body: { community_id: communityId }
        });

        console.log('Response from telegram-community-data:', response);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data?.community) {
          setCommunity(response.data.community);
        } else {
          throw new Error("Community not found");
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

    if (communityId) {
      fetchCommunityData();
    } else {
      console.error("No start parameter provided");
      setLoading(false);
    }
  }, [communityId, toast]);

  return { loading, community };
};
