
import { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { DashboardSubscriber, DashboardInsights } from "./types";

export const useInsights = (
  filteredSubscribers: DashboardSubscriber[],
  activeSubscribers: DashboardSubscriber[],
  inactiveSubscribers: DashboardSubscriber[],
  plans: any[] | undefined
) => {
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

  const insights: DashboardInsights = {
    averageSubscriptionDuration,
    mostPopularPlan: mostPopularPlan.name,
    mostPopularPlanPrice: mostPopularPlan.price,
    mostActiveDay,
    renewalRate
  };

  return { insights };
};
