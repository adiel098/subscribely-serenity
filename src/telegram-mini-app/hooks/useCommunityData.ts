
import { useState, useEffect } from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { fetchCommunityByIdOrLink } from "@/telegram-mini-app/services/communityService";
import { useToast } from "@/components/ui/use-toast";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useCommunityData");

export const useCommunityData = (communityIdOrLink: string | null) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        if (!communityIdOrLink) {
          logger.warn("No community ID or link provided");
          throw new Error("No community ID or link provided");
        }
        
        logger.log(`Fetching community data with ID or link: ${communityIdOrLink}`);
        
        // Remove any "group_" prefix if present
        const idOrLink = communityIdOrLink.startsWith('group_') ? 
                         communityIdOrLink.substring(6) : 
                         communityIdOrLink;
        
        // Check if we're dealing with a UUID or custom link
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
        logger.log(`Parameter type: ${isUUID ? "UUID" : "Custom link"} - "${idOrLink}"`);
        
        const communityData = await fetchCommunityByIdOrLink(idOrLink);
        
        if (!communityData) {
          logger.error(`Community not found with identifier: ${idOrLink}`);
          setError(`Community not found with identifier: ${idOrLink}`);
          throw new Error(`Community not found`);
        }
        
        logger.log(`Successfully fetched community: ${communityData.name}`);
        logger.log(`Has custom_link: ${communityData.custom_link || 'None'}`);
        logger.log(`Is group: ${communityData.is_group ? 'Yes' : 'No'}`);
        logger.log(`Has ${communityData.subscription_plans?.length || 0} subscription plans`);
        
        // Log if no subscription plans are found
        if (!communityData.subscription_plans || communityData.subscription_plans.length === 0) {
          logger.warn(`No active subscription plans found for community: ${communityData.name}`);
        }
        
        setCommunity(communityData);
      } catch (error) {
        logger.error("Error fetching community data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load community data";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setLoading(false);
      }
    };

    if (communityIdOrLink) {
      fetchCommunityData();
    } else {
      logger.error("No community ID or link provided");
      setLoading(false);
    }
  }, [communityIdOrLink, toast]);

  return { loading, community, error };
};
