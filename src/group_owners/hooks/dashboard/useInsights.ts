export const useInsights = (
  filteredSubscribers: any[],
  activeSubscribers: any[],
  inactiveSubscribers: any[],
  plans: any[]
) => {
  // Calculate average subscription duration (simplified)
  const avgDuration = 30; // Placeholder value
  
  // Find most popular plan
  const planCounts: Record<string, number> = {};
  let mostPopularPlanId = '';
  let mostPopularPlanCount = 0;
  
  filteredSubscribers.forEach(sub => {
    const planId = sub.subscription_plan_id || sub.plan?.id;
    if (planId) {
      planCounts[planId] = (planCounts[planId] || 0) + 1;
      if (planCounts[planId] > mostPopularPlanCount) {
        mostPopularPlanCount = planCounts[planId];
        mostPopularPlanId = planId;
      }
    }
  });
  
  // Get details of most popular plan
  const mostPopularPlan = plans.find(plan => plan.id === mostPopularPlanId);
  
  // Calculate renewal rate (simplified)
  const renewalRate = 75; // Placeholder percentage
  
  // Calculate potential revenue (simplified)
  const potentialRevenue = activeSubscribers.reduce((sum, sub) => {
    const planPrice = sub.plan?.price || 0;
    return sum + planPrice;
  }, 0);
  
  return {
    insights: {
      averageSubscriptionDuration: avgDuration,
      mostPopularPlan: mostPopularPlan?.name || 'None',
      mostPopularPlanPrice: mostPopularPlan?.price || 0,
      renewalRate,
      potentialRevenue
    }
  };
};
