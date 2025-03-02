
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
          console.warn("❌ useCommunityData: No community ID provided");
          throw new Error("No community ID provided");
        }
        
        console.log('🔍 useCommunityData: Fetching community data with ID:', communityId);
        
        const payload = { 
          community_id: communityId,
          debug: true
        };
        console.log('📤 useCommunityData: Request payload:', JSON.stringify(payload, null, 2));
        
        const response = await supabase.functions.invoke("telegram-community-data", {
          body: payload
        });

        console.log('📥 useCommunityData: Raw response:', JSON.stringify(response, null, 2));

        if (response.error) {
          console.error('❌ useCommunityData: Error from edge function:', response.error);
          throw new Error(response.error);
        }

        if (response.data?.community) {
          // Ensure subscription_plans is always an array
          const communityData = response.data.community;
          
          console.log('📊 useCommunityData: Community data before processing:', JSON.stringify(communityData, null, 2));
          
          if (!communityData.subscription_plans) {
            console.warn('⚠️ useCommunityData: subscription_plans is missing - adding empty array');
            communityData.subscription_plans = [];
          } else if (!Array.isArray(communityData.subscription_plans)) {
            console.error('❌ useCommunityData: subscription_plans is not an array:', typeof communityData.subscription_plans);
            console.error('Value:', JSON.stringify(communityData.subscription_plans));
            communityData.subscription_plans = [];
          } else {
            console.log(`✅ useCommunityData: Received ${communityData.subscription_plans.length} subscription plans`);
            if (communityData.subscription_plans.length > 0) {
              console.log(`   Plan names: ${communityData.subscription_plans.map(p => p.name).join(', ')}`);
              console.log(`   First plan details:`, JSON.stringify(communityData.subscription_plans[0]));
            }
          }
          
          console.log('🔍 useCommunityData: Processed community data:', JSON.stringify(communityData, null, 2));
          setCommunity(communityData);
        } else {
          console.error('❌ useCommunityData: Community not found in response:', JSON.stringify(response.data));
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
      console.error("❌ useCommunityData: No community ID provided");
      setLoading(false);
    }
  }, [communityId, toast]);

  return { loading, community };
};
