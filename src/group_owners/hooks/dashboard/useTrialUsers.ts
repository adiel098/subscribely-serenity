
import { useMemo } from "react";
import { isAfter } from "date-fns";
import { DashboardSubscriber, TrialUsersData, MiniAppData } from "./types";

export const useTrialUsers = (
  filteredSubscribers: DashboardSubscriber[]
) => {
  const trialUsers = useMemo((): TrialUsersData => {
    const trialSubs = filteredSubscribers.filter(sub => 
      sub.is_trial === true && 
      sub.trial_end_date && 
      isAfter(new Date(sub.trial_end_date), new Date())
    );
    
    const expiredTrials = filteredSubscribers.filter(sub => 
      sub.is_trial === true && 
      sub.trial_end_date && 
      !isAfter(new Date(sub.trial_end_date), new Date())
    );
    
    const convertedTrials = expiredTrials.filter(sub => 
      sub.subscription_status === "active"
    );
    
    const conversionRate = expiredTrials.length > 0 
      ? (convertedTrials.length / expiredTrials.length) * 100 
      : 0;
    
    return {
      count: trialSubs.length,
      conversion: Math.round(conversionRate)
    };
  }, [filteredSubscribers]);

  const miniAppUsers = useMemo((): MiniAppData => {
    const miniAppAccessCount = filteredSubscribers.filter(sub => 
      sub.metadata?.mini_app_accessed === true
    ).length;
    
    const nonSubscribers = filteredSubscribers.filter(sub => 
      sub.metadata?.mini_app_accessed === true && 
      sub.subscription_status !== "active"
    ).length;
    
    return {
      count: miniAppAccessCount,
      nonSubscribers: nonSubscribers
    };
  }, [filteredSubscribers]);

  return {
    trialUsers,
    miniAppUsers
  };
};
