
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "@/telegram-mini-app/types/community.types";
import { useToast } from "@/components/ui/use-toast";

export const useCommunitiesWithDescriptions = (communities: Community[]) => {
  const [enhancedCommunities, setEnhancedCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDescriptions = async () => {
      if (!communities || communities.length === 0) {
        setEnhancedCommunities([]);
        return;
      }

      setLoading(true);

      try {
        // Filter communities that have a Telegram chat ID but no description
        const communitiesNeedingDescription = communities.filter(
          community => community.telegram_chat_id && !community.description
        );

        if (communitiesNeedingDescription.length === 0) {
          // All communities already have descriptions or don't have Telegram chat IDs
          setEnhancedCommunities(communities);
          setLoading(false);
          return;
        }

        // Process all communities in parallel for efficiency
        const enhancedCommunitiesPromises = communitiesNeedingDescription.map(async (community) => {
          try {
            console.log(`Fetching description for community: ${community.name} (${community.id})`);
            
            const { data, error } = await supabase.functions.invoke("get-telegram-channel-info", {
              body: { 
                communityId: community.id, 
                chatId: community.telegram_chat_id,
                autoUpdate: true
              }
            });

            if (error) {
              console.error(`Error fetching description for ${community.name}:`, error);
              return community;
            }

            if (data?.description) {
              console.log(`Got description for ${community.name}: "${data.description}"`);
              return { ...community, description: data.description };
            }
            
            return community;
          } catch (err) {
            console.error(`Error processing community ${community.name}:`, err);
            return community;
          }
        });

        // Wait for all promises to resolve
        const processedCommunities = await Promise.all(enhancedCommunitiesPromises);
        
        // Merge the processed communities with the original list
        const resultCommunities = communities.map(originalCommunity => {
          const processedCommunity = processedCommunities.find(c => c.id === originalCommunity.id);
          return processedCommunity || originalCommunity;
        });

        setEnhancedCommunities(resultCommunities);
      } catch (error) {
        console.error("Error fetching community descriptions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch community descriptions"
        });
        setEnhancedCommunities(communities); // Use original communities on error
      } finally {
        setLoading(false);
      }
    };

    fetchDescriptions();
  }, [communities, toast]);

  return { communities: enhancedCommunities, loading };
};
