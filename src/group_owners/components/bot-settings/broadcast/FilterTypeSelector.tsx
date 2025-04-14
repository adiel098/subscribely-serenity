import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchSubscriptionPlans } from "@/group_owners/hooks/subscription/useFetchSubscriptionPlans";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupMemberCommunities } from "@/group_owners/hooks/useGroupMemberCommunities";
import { supabase } from "@/integrations/supabase/client";

interface FilterTypeSelectorProps {
  value: 'all' | 'active' | 'expired' | 'plan';
  onChange: (value: 'all' | 'active' | 'expired' | 'plan') => void;
  entityId: string;
  entityType: 'community' | 'group';
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
}

export const FilterTypeSelector = ({
  value,
  onChange,
  entityId,
  entityType,
  selectedPlanId,
  setSelectedPlanId
}: FilterTypeSelectorProps) => {
  // For groups, we need to fetch all communities in the group to get their plans
  const { communities: groupCommunities, isLoading: isLoadingGroupCommunities } = 
    useGroupMemberCommunities(entityType === 'group' ? entityId : null);
  
  // For single community
  const { data: communityPlans, isLoading: isLoadingCommunityPlans } = 
    useFetchSubscriptionPlans(entityType === 'community' ? entityId : null);
  
  // State to hold combined plans from all communities if it's a group
  const [combinedPlans, setCombinedPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  
  // When it's a group, fetch plans for all communities in the group
  useEffect(() => {
    const fetchGroupPlans = async () => {
      if (entityType !== 'group' || !groupCommunities || groupCommunities.length === 0) {
        setIsLoadingPlans(false);
        return;
      }
      
      setIsLoadingPlans(true);
      
      try {
        // For each community in the group, fetch their plans
        const plansPromises = groupCommunities.map(community => 
          supabase
            .from('project_plans')
            .select('*')
            .eq('community_id', community.id)
            .eq('is_active', true)
        );
        
        const plansResults = await Promise.all(plansPromises);
        
        // Combine all plans with community info
        const allPlans = plansResults.flatMap((result, index) => {
          if (result.error) {
            console.error(`Error fetching plans for community ${groupCommunities[index].id}:`, result.error);
            return [];
          }
          
          return result.data.map(plan => ({
            ...plan,
            community_name: groupCommunities[index].name
          }));
        });
        
        setCombinedPlans(allPlans);
      } catch (error) {
        console.error('Error fetching group plans:', error);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    
    fetchGroupPlans();
  }, [entityType, groupCommunities]);
  
  // Reset selected plan when changing filter type
  useEffect(() => {
    if (value !== 'plan') {
      setSelectedPlanId("");
    }
  }, [value, setSelectedPlanId]);
  
  const isLoading = 
    (entityType === 'community' && isLoadingCommunityPlans) || 
    (entityType === 'group' && (isLoadingGroupCommunities || isLoadingPlans));
  
  const plans = entityType === 'community' ? communityPlans : combinedPlans;
  
  return (
    <div className="space-y-4">
      <Select
        value={value}
        onValueChange={(val) => onChange(val as any)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select recipients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Members</SelectItem>
          <SelectItem value="active">Members with Active Subscriptions</SelectItem>
          <SelectItem value="expired">Members with Expired Subscriptions</SelectItem>
          <SelectItem value="plan">Specific Subscription Plan</SelectItem>
        </SelectContent>
      </Select>
      
      {value === 'plan' && (
        <div className="mt-2">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : plans && plans.length > 0 ? (
            <Select
              value={selectedPlanId}
              onValueChange={setSelectedPlanId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subscription plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {entityType === 'group' && plan.community_name 
                      ? `${plan.name} (${plan.community_name})` 
                      : plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              No subscription plans available
            </p>
          )}
        </div>
      )}
    </div>
  );
};
