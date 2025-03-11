
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useGroupMemberCommunities } from "@/group_owners/hooks/useGroupMemberCommunities";
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MiniAppData } from "./types";

export const useGroupDashboardStats = (groupId: string | null) => {
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  // First get all communities in the group
  const { communities, isLoading: communitiesLoading, communityIds } = useGroupMemberCommunities(groupId);
  
  // State to hold aggregated subscribers from all communities
  const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  
  // Fetch subscribers for each community in the group
  useEffect(() => {
    if (!communityIds || !communityIds.length) {
      setAllSubscribers([]);
      setIsLoadingSubscribers(false);
      return;
    }
    
    setIsLoadingSubscribers(true);
    
    const fetchAllSubscribers = async () => {
      try {
        const { data: subscribers, error } = await supabase
          .from("telegram_chat_members")
          .select("*")
          .in("community_id", communityIds);
        
        if (error) {
          console.error("Error fetching group subscribers:", error);
          setIsLoadingSubscribers(false);
          return;
        }
        
        setAllSubscribers(subscribers || []);
        setIsLoadingSubscribers(false);
      } catch (error) {
        console.error("Exception fetching group subscribers:", error);
        setIsLoadingSubscribers(false);
      }
    };
    
    fetchAllSubscribers();
  }, [communityIds]);
  
  // Fetch subscription plans for all communities
  useEffect(() => {
    if (!communityIds || !communityIds.length) {
      setAllPlans([]);
      setIsLoadingPlans(false);
      return;
    }
    
    setIsLoadingPlans(true);
    
    const fetchAllPlans = async () => {
      try {
        const { data: plans, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .in("community_id", communityIds);
        
        if (error) {
          console.error("Error fetching group plans:", error);
          setIsLoadingPlans(false);
          return;
        }
        
        setAllPlans(plans || []);
        setIsLoadingPlans(false);
      } catch (error) {
        console.error("Exception fetching group plans:", error);
        setIsLoadingPlans(false);
      }
    };
    
    fetchAllPlans();
  }, [communityIds]);
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(allSubscribers, timeRangeStartDate);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  
  const { trialUsers } = useTrialUsers(filteredSubscribers);
  
  // Fetch mini app users for this group
  const { data: miniAppUsersData, isLoading: miniAppUsersLoading } = useQuery({
    queryKey: ["groupMiniAppUsers", groupId, communityIds],
    queryFn: async () => {
      if (!groupId || !communityIds || !communityIds.length) return { count: 0, nonSubscribers: 0 };
      
      try {
        const { data: miniAppUsers, error } = await supabase
          .from("telegram_mini_app_users")
          .select("*")
          .in("community_id", communityIds);
        
        if (error) {
          console.error("Error fetching group mini app users:", error);
          return { count: 0, nonSubscribers: 0 };
        }
        
        // Get the telegram_user_ids of active subscribers
        const activeUserIds = activeSubscribers.map(sub => sub.telegram_user_id);
        
        // Count non-subscribers
        const nonSubscribersCount = miniAppUsers.filter(
          user => !activeUserIds.includes(user.telegram_id)
        ).length;
        
        return {
          count: miniAppUsers.length,
          nonSubscribers: nonSubscribersCount,
          users: miniAppUsers
        };
      } catch (error) {
        console.error("Exception fetching group mini app users:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    },
    enabled: !!groupId && !!communityIds && communityIds.length > 0 && !isLoadingSubscribers
  });
  
  const miniAppUsers: MiniAppData = {
    count: miniAppUsersData?.count || 0,
    nonSubscribers: miniAppUsersData?.nonSubscribers || 0
  };
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  
  const { insights } = useInsights(
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    allPlans
  );
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  
  // Fetch group owner info (same as the community owner)
  const { data: ownerInfo, isLoading: ownerLoading } = useQuery({
    queryKey: ["groupOwner", groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      try {
        const { data: group, error } = await supabase
          .from("community_groups")
          .select("owner_id")
          .eq("id", groupId)
          .single();
        
        if (error || !group) {
          console.error("Error fetching group owner:", error);
          return null;
        }
        
        const { data: owner, error: ownerError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", group.owner_id)
          .single();
        
        if (ownerError) {
          console.error("Error fetching owner profile:", ownerError);
          return null;
        }
        
        return owner;
      } catch (error) {
        console.error("Exception fetching group owner:", error);
        return null;
      }
    },
    enabled: !!groupId
  });
  
  const isLoading = 
    communitiesLoading || 
    isLoadingSubscribers || 
    isLoadingPlans || 
    miniAppUsersLoading || 
    ownerLoading;
  
  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
    communities,
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate,
    trialUsers,
    miniAppUsers,
    paymentStats,
    insights,
    
    memberGrowthData,
    revenueData,
    
    ownerInfo,
    
    isLoading
  };
};
