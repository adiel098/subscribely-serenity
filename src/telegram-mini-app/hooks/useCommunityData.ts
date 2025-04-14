import { useState, useEffect } from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { fetchCommunityByIdOrLink } from "@/telegram-mini-app/services/communityService";
import { useToast } from "@/components/ui/use-toast";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { supabase } from "@/integrations/supabase/client";
import { verifyPlansInDatabase } from "@/telegram-mini-app/utils/planDebugUtils";

const logger = createLogger("useCommunityData");

export const useCommunityData = (communityIdOrLink: string | null) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // If no community ID is provided, we're in discovery mode
        // Just set loading to false and return without an error
        if (!communityIdOrLink || communityIdOrLink === "") {
          logger.log("📱 No community ID provided - entering discovery mode");
          setLoading(false);
          setCommunity(null);
          return;
        }
        
        logger.log(`🔄 Fetching community data with ID or link: ${communityIdOrLink}`);
        
        // Remove any "group_" prefix if present
        const idOrLink = communityIdOrLink.startsWith('group_') ? 
                         communityIdOrLink.substring(6) : 
                         communityIdOrLink;
        
        // Check if we're dealing with a UUID or custom link
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
        logger.log(`🏷️ Parameter type: ${isUUID ? "UUID" : "Custom link"} - "${idOrLink}"`);
        
        // Perform direct database check for plans (for debugging)
        if (isUUID) {
          logger.debug(`Performing verification check for plans...`);
          await verifyPlansInDatabase(idOrLink, supabase);
        }
        
        logger.debug(`📞 Calling fetchCommunityByIdOrLink with: ${idOrLink}`);
        const communityData = await fetchCommunityByIdOrLink(idOrLink);
        
        // Basic checks on community data
        if (!communityData || !communityData.id) {
          logger.error('❌ Community data invalid:', communityData);
          setError("Failed to load community data");
          return;
        }
        
        // Check if community has no subscription plans
        if (!communityData.subscription_plans || communityData.subscription_plans.length === 0) {
          setError("Community has no subscription plans");
          return;
        }
        
        // Log success and plan info
        if (process.env.NODE_ENV !== 'production') {
          logger.success(`📋 Found ${communityData.subscription_plans.length} subscription plans`);
          
          // Log basic details of each plan for debugging
          communityData.subscription_plans.forEach((plan, index) => {
            logger.debug(`📝 Plan ${index + 1}: ${plan.name} (${plan.id}) - ${plan.price} ${plan.interval}`);
          });
        }
        
        logger.success(`✅ Successfully fetched community: ${communityData.name} (ID: ${communityData.id})`);
        logger.log(`🔗 Has custom_link: ${communityData.custom_link || 'None'}`);
        logger.log(`👥 Is group: ${communityData.is_group ? 'Yes' : 'No'}`);
        
        setCommunity(communityData);
      } catch (error) {
        logger.error("❌ Error fetching community data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load community data";
        setError(errorMessage);
        
        // Only show error toast if we were actually trying to load a specific community
        if (communityIdOrLink && communityIdOrLink !== "") {
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [communityIdOrLink, toast]);

  return { loading, community, error };
};
