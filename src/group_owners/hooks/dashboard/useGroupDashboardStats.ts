import { useCommunityContext } from "@/contexts/CommunityContext";
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MiniAppData } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupDashboardStats");

export const useGroupDashboardStats = (groupId: string | null) => {
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  // Fetch subscribers directly for the group ID, not aggregating from member communities
  const { data: subscribersData, isLoading: subscribersLoading } = useQuery({
    queryKey: ["group-subscribers", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      logger.log("Fetching subscribers for group ID:", groupId);
      
      try {
        // Fetch subscribers directly from the database with plan information
        const { data: subscribers, error: subscribersError } = await supabase
          .from("community_subscribers")
          .select(`
            *,
            plan:subscription_plan_id (
              id,
              name,
              price,
              interval
            )
          `)
          .eq("community_id", groupId);

        if (subscribersError) {
          logger.error("Error fetching group subscribers:", subscribersError);
          return [];
        }

        // Create a map to store user details
        const userDetails: Record<string, { first_name: string | null, last_name: string | null }> = {};
        
        // Fetch user details from telegram_mini_app_users for all telegram_user_ids
        if (subscribers.length > 0) {
          const telegramIds = subscribers.map(subscriber => subscriber.telegram_user_id);
          
          const { data: users, error: usersError } = await supabase
            .from("telegram_mini_app_users")
            .select(`
              telegram_id,
              first_name,
              last_name
            `)
            .in("telegram_id", telegramIds);
            
          if (usersError) {
            logger.error("Error fetching user details for group:", usersError);
          } else if (users) {
            // Create a map of user details by telegram_id
            users.forEach(user => {
              userDetails[user.telegram_id] = {
                first_name: user.first_name,
                last_name: user.last_name
              };
            });
          }
        }

        // Get payment status from subscription_payments table
        const paymentStatusMap: Record<string, string> = {};
        
        if (subscribers.length > 0) {
          const telegramUserIds = subscribers.map(subscriber => subscriber.telegram_user_id);
          
          // Get the latest payment status for each user
          const { data: payments, error: paymentsError } = await supabase
            .from("subscription_payments")
            .select(`
              telegram_user_id,
              status
            `)
            .eq("community_id", groupId)
            .in("telegram_user_id", telegramUserIds)
            .order("created_at", { ascending: false });
            
          if (paymentsError) {
            logger.error("Error fetching payment status for group:", paymentsError);
          } else if (payments) {
            // Only keep the most recent payment status for each user
            const processedUserIds = new Set<string>();
            
            payments.forEach(payment => {
              if (!processedUserIds.has(payment.telegram_user_id)) {
                paymentStatusMap[payment.telegram_user_id] = payment.status;
                processedUserIds.add(payment.telegram_user_id);
              }
            });
          }
        }

        // Map the subscribers with their additional details
        return subscribers.map(subscriber => ({
          ...subscriber,
          first_name: userDetails[subscriber.telegram_user_id]?.first_name || null,
          last_name: userDetails[subscriber.telegram_user_id]?.last_name || null,
          payment_status: paymentStatusMap[subscriber.telegram_user_id] || null
        }));
      } catch (error) {
        logger.error("Exception in group subscribers fetch:", error);
        return [];
      }
    },
    enabled: !!groupId
  });
  
  // Fetch subscription plans for the group
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["group-plans", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      logger.log("Fetching plans for group ID:", groupId);
      
      try {
        const { data: plans, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("community_id", groupId);
        
        if (error) {
          logger.error("Error fetching group plans:", error);
          return [];
        }
        
        return plans || [];
      } catch (error) {
        logger.error("Exception in group plans fetch:", error);
        return [];
      }
    },
    enabled: !!groupId
  });
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribersData, timeRangeStartDate);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  
  const { trialUsers } = useTrialUsers(filteredSubscribers);
  
  // Fetch mini app users for this group
  const { data: miniAppUsersData, isLoading: miniAppUsersLoading } = useQuery({
    queryKey: ["groupMiniAppUsers", groupId],
    queryFn: async () => {
      if (!groupId) return { count: 0, nonSubscribers: 0 };
      
      try {
        const { data: miniAppUsers, error } = await supabase
          .from("telegram_mini_app_users")
          .select("*")
          .eq("community_id", groupId);
        
        if (error) {
          logger.error("Error fetching group mini app users:", error);
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
        logger.error("Exception fetching group mini app users:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    },
    enabled: !!groupId && !subscribersLoading
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
    plansData
  );
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  
  // Fetch group owner info
  const { data: ownerInfo, isLoading: ownerLoading } = useQuery({
    queryKey: ["groupOwner", groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      try {
        const { data: group, error } = await supabase
          .from("communities")
          .select("owner_id")
          .eq("id", groupId)
          .eq("is_group", true)
          .single();
        
        if (error || !group) {
          logger.error("Error fetching group owner:", error);
          return null;
        }
        
        const { data: owner, error: ownerError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", group.owner_id)
          .single();
        
        if (ownerError) {
          logger.error("Error fetching owner profile:", ownerError);
          return null;
        }
        
        return owner;
      } catch (error) {
        logger.error("Exception fetching group owner:", error);
        return null;
      }
    },
    enabled: !!groupId
  });
  
  const isLoading = 
    subscribersLoading || 
    plansLoading || 
    miniAppUsersLoading || 
    ownerLoading;
  
  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
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
