
import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { DashboardSubscriber } from "./types";

export const useInsights = (
  filteredSubscribers: DashboardSubscriber[],
  activeSubscribers: DashboardSubscriber[],
  inactiveSubscribers: DashboardSubscriber[],
  plans: any[] | undefined
) => {
  const insights = useMemo(() => {
    // Calculate average subscription duration
    let totalDuration = 0;
    let subscribersWithDuration = 0;
    
    filteredSubscribers.forEach(sub => {
      if (sub.subscription_start_date && sub.subscription_end_date) {
        const startDate = new Date(sub.subscription_start_date);
        const endDate = new Date(sub.subscription_end_date);
        if (startDate < endDate) {
          totalDuration += differenceInDays(endDate, startDate);
          subscribersWithDuration++;
        }
      }
    });
    
    const averageSubscriptionDuration = subscribersWithDuration > 0 
      ? Math.round(totalDuration / subscribersWithDuration) 
      : 0;
    
    // Find most popular plan
    const planCounts: Record<string, {count: number, price: number}> = {};
    
    filteredSubscribers.forEach(sub => {
      if (sub.plan && sub.plan.id) {
        const planId = sub.plan.id;
        if (!planCounts[planId]) {
          planCounts[planId] = { count: 0, price: sub.plan.price || 0 };
        }
        planCounts[planId].count++;
      } else if (sub.subscription_plan_id && plans) {
        // Try to find the plan from the plans array
        const matchingPlan = plans.find(plan => plan.id === sub.subscription_plan_id);
        if (matchingPlan) {
          if (!planCounts[matchingPlan.id]) {
            planCounts[matchingPlan.id] = { count: 0, price: matchingPlan.price || 0 };
          }
          planCounts[matchingPlan.id].count++;
        }
      }
    });
    
    let mostPopularPlanId = "";
    let mostPopularPlanCount = 0;
    let mostPopularPlanPrice = 0;
    
    Object.entries(planCounts).forEach(([planId, { count, price }]) => {
      if (count > mostPopularPlanCount) {
        mostPopularPlanId = planId;
        mostPopularPlanCount = count;
        mostPopularPlanPrice = price;
      }
    });
    
    // Get most popular plan name
    let mostPopularPlan = "None";
    if (mostPopularPlanId && plans) {
      const matchingPlan = plans.find(plan => plan.id === mostPopularPlanId);
      if (matchingPlan) {
        mostPopularPlan = matchingPlan.name;
      } else {
        // If not found in plans, try to find in the subscribers
        const subWithPlan = filteredSubscribers.find(sub => sub.plan && sub.plan.id === mostPopularPlanId);
        if (subWithPlan && subWithPlan.plan && subWithPlan.plan.name) {
          mostPopularPlan = subWithPlan.plan.name;
        }
      }
    }
    
    // Calculate renewal rate
    const renewalRate = activeSubscribers.length > 0 
      ? Math.round((activeSubscribers.length / (activeSubscribers.length + inactiveSubscribers.length)) * 100) 
      : 0;
    
    // Determine most active day (simplified example)
    const mostActiveDay = "Monday"; // Would need day-of-week analysis of joined_at dates
    
    console.log("Insights calculated:", {
      averageSubscriptionDuration,
      mostPopularPlan,
      mostPopularPlanPrice,
      renewalRate,
      mostActiveDay,
      planCounts
    });
    
    return {
      averageSubscriptionDuration,
      mostPopularPlan,
      mostPopularPlanPrice,
      renewalRate,
      mostActiveDay
    };
  }, [filteredSubscribers, activeSubscribers, inactiveSubscribers, plans]);

  return { insights };
};
