
import { useState, useEffect } from "react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCommunityData = (communityIdOrGroupId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Community | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        if (!communityIdOrGroupId) {
          console.warn("❌ useCommunityData: No community or group ID provided");
          throw new Error("No community or group ID provided");
        }
        
        // Check if we're dealing with a group ID (starts with "group_")
        const isGroup = communityIdOrGroupId.startsWith('group_');
        const id = isGroup ? communityIdOrGroupId.substring(6) : communityIdOrGroupId;
        
        console.log(`🔍 useCommunityData: Fetching ${isGroup ? 'group' : 'community'} data with ID:`, id);
        
        const payload = { 
          [isGroup ? 'group_id' : 'community_id']: id,
          debug: true,
          fetch_telegram_data: true
        };
        console.log('📤 useCommunityData: Request payload:', JSON.stringify(payload, null, 2));
        
        const response = await supabase.functions.invoke("telegram-community-data", {
          body: payload
        });

        console.log('📥 useCommunityData: Raw response:', JSON.stringify(response, null, 2));

        if (response.error) {
          console.error('❌ useCommunityData: Error from edge function:', response.error);
          setError(response.error.message || `Error fetching ${isGroup ? 'group' : 'community'} data`);
          throw new Error(response.error);
        }

        if (response.data?.community) {
          // Ensure subscription_plans is always an array
          const communityData = response.data.community;
          
          console.log('📊 useCommunityData: Community data before processing:', JSON.stringify(communityData, null, 2));
          console.log('📝 useCommunityData: Description from API:', communityData.description);
          console.log('📝 useCommunityData: Description type:', typeof communityData.description);
          
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
          setError(`${isGroup ? 'Group' : 'Community'} not found`);
          throw new Error(`${isGroup ? 'Group' : 'Community'} not found`);
        }
      } catch (error) {
        console.error("❌ useCommunityData: Error fetching data:", error);
        if (!error) setError("Failed to load data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load community data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    if (communityIdOrGroupId) {
      fetchCommunityData();
    } else {
      console.error("❌ useCommunityData: No community or group ID provided");
      setLoading(false);
    }
  }, [communityIdOrGroupId, toast]);

  return { loading, community, error };
};
