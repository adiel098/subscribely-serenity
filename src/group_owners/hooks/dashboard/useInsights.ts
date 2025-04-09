
import { useMemo } from "react";

// Define a simple insight type
export interface Insight {
  title: string;
  description: string;
  type: "positive" | "negative" | "info" | "warning";
  value?: number | string;
  trend?: number;
}

import { InsightData } from "./types";

export const useInsights = (
  subscribers: any[] = [],
  activeSubscribers: any[] = [],
  inactiveSubscribers: any[] = [],
  plans: any[] = []
) => {
  const insights = useMemo<Insight[]>(() => {
    const insights: Insight[] = [];

    // Calculate average subscription duration
    let totalSubscriptionDays = 0;
    let subscribersWithEndDate = 0;
    
    for (const subscriber of subscribers) {
      if (subscriber.subscription_start_date && subscriber.subscription_end_date) {
        const startDate = new Date(subscriber.subscription_start_date);
        const endDate = new Date(subscriber.subscription_end_date);
        const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (durationDays > 0) {
          totalSubscriptionDays += durationDays;
          subscribersWithEndDate++;
        }
      }
    }
    
    const averageSubscriptionDuration = subscribersWithEndDate > 0 
      ? Math.round(totalSubscriptionDays / subscribersWithEndDate)
      : 0;
    
    if (averageSubscriptionDuration > 0) {
      insights.push({
        title: "Average subscription duration",
        description: "The average number of days that subscribers stay subscribed",
        type: "info",
        value: averageSubscriptionDuration + " days"
      });
    }
    
    // Find the most popular subscription plan
    const planCounts: Record<string, number> = {};
    
    for (const subscriber of subscribers) {
      if (subscriber.plan?.id) {
        planCounts[subscriber.plan.id] = (planCounts[subscriber.plan.id] || 0) + 1;
      }
    }
    
    let mostPopularPlanId: string | null = null;
    let mostPopularPlanCount = 0;
    
    for (const planId in planCounts) {
      if (planCounts[planId] > mostPopularPlanCount) {
        mostPopularPlanId = planId;
        mostPopularPlanCount = planCounts[planId];
      }
    }
    
    const mostPopularPlan = plans?.find(plan => plan.id === mostPopularPlanId);
    
    if (mostPopularPlan) {
      insights.push({
        title: "Most popular plan",
        description: "The subscription plan most subscribers choose",
        type: "positive",
        value: mostPopularPlan.name,
      });
      
      insights.push({
        title: "Most popular plan price",
        description: "The price of the most popular subscription plan",
        type: "info",
        value: `$${mostPopularPlan.price}`
      });
    }
    
    // Calculate renewal rate
    const totalExpired = subscribers.filter(sub => 
      sub.subscription_end_date && new Date(sub.subscription_end_date) < new Date()
    ).length;
    
    const renewedSubscribers = subscribers.filter(sub => 
      sub.subscription_end_date && 
      new Date(sub.subscription_end_date) < new Date() && 
      sub.subscription_status === 'active'
    ).length;
    
    const renewalRate = totalExpired > 0 ? (renewedSubscribers / totalExpired) * 100 : 0;
    
    if (totalExpired > 0) {
      insights.push({
        title: "Renewal rate",
        description: "Percentage of expired subscriptions that were renewed",
        type: renewalRate >= 70 ? "positive" : renewalRate >= 40 ? "info" : "warning",
        value: `${Math.round(renewalRate)}%`
      });
    }
    
    return insights;
  }, [subscribers, plans]);

  // Format insights for InsightPanel component
  const insightsData: InsightData = {
    averageSubscriptionDuration: insights.find(i => i.title === "Average subscription duration")?.value?.toString().replace(" days", "") ? 
      parseInt(insights.find(i => i.title === "Average subscription duration")?.value?.toString().replace(" days", "") || "0") : 0,
    mostPopularPlan: insights.find(i => i.title === "Most popular plan")?.value?.toString() || "No Plan",
    mostPopularPlanPrice: insights.find(i => i.title === "Most popular plan price")?.value?.toString().replace("$", "") ? 
      parseFloat(insights.find(i => i.title === "Most popular plan price")?.value?.toString().replace("$", "") || "0") : 0,
    renewalRate: insights.find(i => i.title === "Renewal rate")?.value?.toString().replace("%", "") ? 
      parseInt(insights.find(i => i.title === "Renewal rate")?.value?.toString().replace("%", "") || "0") : 0,
    potentialRevenue: (activeSubscribers.length || 0) * (insightsData?.mostPopularPlanPrice || 0)
  };

  return { insights, insightsData };
};
