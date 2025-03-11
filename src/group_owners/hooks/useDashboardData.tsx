import { useState, useMemo } from "react";
import { subDays, format, isAfter, differenceInDays } from "date-fns";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

type TimeRange = "7d" | "30d" | "90d" | "all";

export interface PaymentStatistics {
  completed: number;
  pending: number;
  failed: number;
}

export interface TrialUsersData {
  count: number;
  conversion: number;
}

export interface MiniAppData {
  count: number;
  nonSubscribers: number;
}

export const useDashboardData = (subscribers: Subscriber[] | undefined, plans: any[] | undefined) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return subDays(now, 7);
      case "30d":
        return subDays(now, 30);
      case "90d":
        return subDays(now, 90);
      case "all":
      default:
        return new Date(0); // Beginning of time
    }
  };

  const timeRangeStartDate = useMemo(() => getTimeRangeDate(), [timeRange]);
  
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 90 days";
      case "all":
        return "All time";
    }
  }, [timeRange]);

  const filteredSubscribers = useMemo(() => {
    if (!subscribers) return [];
    
    return subscribers.filter(sub => 
      isAfter(new Date(sub.joined_at), timeRangeStartDate)
    );
  }, [subscribers, timeRangeStartDate]);

  const activeSubscribers = useMemo(() => {
    return filteredSubscribers.filter(sub => sub.subscription_status === "active" && sub.is_active);
  }, [filteredSubscribers]);

  const inactiveSubscribers = useMemo(() => {
    return filteredSubscribers.filter(sub => sub.subscription_status !== "active" || !sub.is_active);
  }, [filteredSubscribers]);

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

  const paymentStats = useMemo((): PaymentStatistics => {
    return {
      completed: filteredSubscribers.filter(sub => 
        sub.payment_status === "completed" || sub.payment_status === "successful"
      ).length,
      pending: filteredSubscribers.filter(sub => 
        sub.payment_status === "pending" || sub.payment_status === "processing"
      ).length,
      failed: filteredSubscribers.filter(sub => 
        sub.payment_status === "failed" || sub.payment_status === "error"
      ).length
    };
  }, [filteredSubscribers]);

  const totalRevenue = useMemo(() => {
    return filteredSubscribers.reduce((sum, sub) => {
      if (sub.plan) {
        return sum + (sub.plan.price || 0);
      }
      return sum;
    }, 0);
  }, [filteredSubscribers]);

  const avgRevenuePerSubscriber = useMemo(() => {
    if (filteredSubscribers.length === 0) return 0;
    return totalRevenue / filteredSubscribers.length;
  }, [totalRevenue, filteredSubscribers]);

  const conversionRate = useMemo(() => {
    if (filteredSubscribers.length === 0) return 0;
    return (activeSubscribers.length / filteredSubscribers.length) * 100;
  }, [activeSubscribers, filteredSubscribers]);

  const memberGrowthData = useMemo(() => {
    if (!filteredSubscribers.length) return [];
    
    const dataByDate: Record<string, { date: string; members: number }> = {};
    
    filteredSubscribers.forEach(sub => {
      const date = format(new Date(sub.joined_at), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, members: 0 };
      }
      dataByDate[date].members += 1;
    });
    
    return Object.values(dataByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredSubscribers]);

  const revenueData = useMemo(() => {
    if (!filteredSubscribers.length) return [];
    
    const dataByDate: Record<string, { date: string; revenue: number }> = {};
    
    filteredSubscribers.forEach(sub => {
      if (!sub.plan?.price) return;
      
      const date = format(new Date(sub.subscription_start_date || sub.joined_at), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, revenue: 0 };
      }
      dataByDate[date].revenue += sub.plan.price;
    });
    
    return Object.values(dataByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredSubscribers]);

  const dailyStats = useMemo(() => {
    if (!filteredSubscribers.length) return [];
    
    const dataByDate: Record<string, { date: string; subscriptions: number; revenue: number }> = {};
    
    filteredSubscribers.forEach(sub => {
      const date = format(new Date(sub.joined_at), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, subscriptions: 0, revenue: 0 };
      }
      dataByDate[date].subscriptions += 1;
      if (sub.plan?.price) {
        dataByDate[date].revenue += sub.plan.price;
      }
    });
    
    return Object.values(dataByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredSubscribers]);

  const averageSubscriptionDuration = useMemo(() => {
    if (!filteredSubscribers.length) return 0;
    
    let totalDays = 0;
    let count = 0;
    
    filteredSubscribers.forEach(sub => {
      if (sub.subscription_start_date && sub.subscription_end_date) {
        const startDate = new Date(sub.subscription_start_date);
        const endDate = new Date(sub.subscription_end_date);
        const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (durationDays > 0) {
          totalDays += durationDays;
          count++;
        }
      }
    });
    
    return count > 0 ? Math.round(totalDays / count) : 0;
  }, [filteredSubscribers]);

  const mostPopularPlan = useMemo(() => {
    if (!filteredSubscribers.length || !plans?.length) return { name: "None", price: 0 };
    
    const planCounts: Record<string, { count: number; name: string; price: number }> = {};
    
    filteredSubscribers.forEach(sub => {
      if (sub.plan?.id) {
        if (!planCounts[sub.plan.id]) {
          planCounts[sub.plan.id] = { 
            count: 0, 
            name: sub.plan.name || "Unknown", 
            price: sub.plan.price || 0 
          };
        }
        planCounts[sub.plan.id].count += 1;
      }
    });
    
    const sortedPlans = Object.values(planCounts).sort((a, b) => b.count - a.count);
    return sortedPlans.length > 0 ? sortedPlans[0] : { name: "None", price: 0 };
  }, [filteredSubscribers, plans]);

  const mostActiveDay = useMemo(() => {
    if (!filteredSubscribers.length) return "N/A";
    
    const dayCount: Record<string, number> = {};
    
    filteredSubscribers.forEach(sub => {
      const dayOfWeek = format(new Date(sub.joined_at), "EEEE");
      dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
    });
    
    let maxDay = "";
    let maxCount = 0;
    
    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxDay = day;
        maxCount = count;
      }
    });
    
    return maxDay;
  }, [filteredSubscribers]);

  const renewalRate = useMemo(() => {
    return Math.round((activeSubscribers.length / (activeSubscribers.length + inactiveSubscribers.length || 1)) * 100);
  }, [activeSubscribers, inactiveSubscribers]);

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
    memberGrowthData,
    revenueData,
    dailyStats,
    averageSubscriptionDuration,
    mostPopularPlan: mostPopularPlan.name,
    mostPopularPlanPrice: mostPopularPlan.price,
    mostActiveDay,
    renewalRate,
    trialUsers,
    miniAppUsers,
    paymentStats,
    insights: {
      averageSubscriptionDuration,
      mostPopularPlan: mostPopularPlan.name,
      mostPopularPlanPrice: mostPopularPlan.price,
      mostActiveDay,
      renewalRate
    }
  };
};
