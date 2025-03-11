
import { useState, useMemo } from "react";
import { subDays, format, isAfter } from "date-fns";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

type TimeRange = "7d" | "30d" | "90d" | "all";

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

  // Calculate member growth data
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

  // Calculate revenue data
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

  // Calculate daily stats for bar chart
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

  // Calculate insights
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

  // Most popular plan
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

  // Most active day
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

  // Renewal rate (mock data - would need actual renewal tracking)
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
    insights: {
      averageSubscriptionDuration,
      mostPopularPlan: mostPopularPlan.name,
      mostPopularPlanPrice: mostPopularPlan.price,
      mostActiveDay,
      renewalRate
    }
  };
};
