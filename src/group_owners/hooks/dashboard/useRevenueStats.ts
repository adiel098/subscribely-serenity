
import { useMemo } from "react";
import { DashboardSubscriber } from "./types";

export const useRevenueStats = (
  filteredSubscribers: DashboardSubscriber[]
) => {
  const totalRevenue = useMemo(() => {
    let revenue = 0;
    
    filteredSubscribers.forEach(sub => {
      // If the subscriber has a plan with a price, add it to the revenue
      if (sub.plan && sub.plan.price) {
        revenue += sub.plan.price;
      } 
      // If no plan but has subscription_plan_id, try to infer a price (future improvement)
    });
    
    console.log("Total revenue calculated:", revenue);
    return revenue;
  }, [filteredSubscribers]);

  const avgRevenuePerSubscriber = useMemo(() => {
    if (filteredSubscribers.length === 0) return 0;
    return totalRevenue / filteredSubscribers.length;
  }, [totalRevenue, filteredSubscribers]);

  const conversionRate = useMemo(() => {
    if (filteredSubscribers.length === 0) return 0;
    const activeCount = filteredSubscribers.filter(
      sub => sub.subscription_status === "active" && sub.is_active
    ).length;
    return (activeCount / filteredSubscribers.length) * 100;
  }, [filteredSubscribers]);

  return {
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate
  };
};
