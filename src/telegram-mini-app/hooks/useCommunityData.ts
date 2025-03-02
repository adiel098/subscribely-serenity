
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
        
        console.log('🔍 useCommunityData: Fetching community data with ID:', communityId);
        
        const response = await supabase.functions.invoke("telegram-community-data", {
          body: { 
            community_id: communityId,
            debug: true // Enable debug logs
          }
        });

        console.log('🔍 useCommunityData: Response from telegram-community-data:', response);

        if (response.error) {
          console.error('❌ useCommunityData: Error from edge function:', response.error);
          throw new Error(response.error);
        }

        if (response.data?.community) {
          // Ensure subscription_plans is always an array
          const communityData = response.data.community;
          if (!communityData.subscription_plans) {
            console.warn('⚠️ useCommunityData: subscription_plans is missing - adding empty array');
            communityData.subscription_plans = [];
          } else if (!Array.isArray(communityData.subscription_plans)) {
            console.error('❌ useCommunityData: subscription_plans is not an array:', communityData.subscription_plans);
            communityData.subscription_plans = [];
          } else {
            console.log(`✅ useCommunityData: Received ${communityData.subscription_plans.length} subscription plans`);
            if (communityData.subscription_plans.length > 0) {
              console.log(`   Plan names: ${communityData.subscription_plans.map(p => p.name).join(', ')}`);
            }
          }
          
          console.log('🔍 useCommunityData: Processed community data:', communityData);
          setCommunity(communityData);
        } else {
          console.error('❌ useCommunityData: Community not found in response:', response);
          throw new Error("Community not found");
        }
      } catch (error) {
        console.error("❌ useCommunityData: Error fetching community data:", error);
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
      console.error("❌ useCommunityData: No start parameter provided");
      setLoading(false);
    }
  }, [communityId, toast]);

  return { loading, community };
};
