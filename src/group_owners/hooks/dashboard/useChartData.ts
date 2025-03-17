
import { useMemo } from "react";
import { format } from "date-fns";
import { DashboardSubscriber, ChartDataPoint } from "./types";

export const useChartData = (
  filteredSubscribers: DashboardSubscriber[]
) => {
  const memberGrowthData = useMemo(() => {
    if (!filteredSubscribers.length) return [];
    
    const dataByDate: Record<string, ChartDataPoint> = {};
    
    filteredSubscribers.forEach(sub => {
      const date = format(new Date(sub.joined_at), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, members: 0, revenue: 0 };
      }
      dataByDate[date].members += 1;
    });
    
    return Object.values(dataByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredSubscribers]);

  const revenueData = useMemo(() => {
    if (!filteredSubscribers.length) return [];
    
    const dataByDate: Record<string, ChartDataPoint> = {};
    
    filteredSubscribers.forEach(sub => {
      if (!sub.plan?.price) return;
      
      const date = format(new Date(sub.subscription_start_date || sub.joined_at), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, members: 0, revenue: 0 };
      }
      dataByDate[date].revenue += sub.plan.price;
    });
    
    return Object.values(dataByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredSubscribers]);

  return {
    memberGrowthData,
    revenueData
  };
};
