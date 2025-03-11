
import { useMemo } from "react";
import { DashboardSubscriber } from "./types";

export const useRevenueStats = (
  filteredSubscribers: DashboardSubscriber[]
) => {
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
