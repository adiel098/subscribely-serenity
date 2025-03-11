
import { useMemo } from "react";
import { isAfter } from "date-fns";
import { DashboardSubscriber } from "./types";

export const useFilteredSubscribers = (
  subscribers: DashboardSubscriber[] | undefined,
  timeRangeStartDate: Date
) => {
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

  return {
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers
  };
};
