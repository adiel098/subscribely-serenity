
import { useMemo } from "react";

export const useFilteredSubscribers = (subscribers: any[] = [], timeRangeStartDate: Date | null) => {
  return useMemo(() => {
    // Safety check to ensure subscribers is an array
    if (!Array.isArray(subscribers)) {
      return {
        filteredSubscribers: [],
        activeSubscribers: [],
        inactiveSubscribers: []
      };
    }
    
    // Filter subscribers based on time range
    const filteredSubscribers = !timeRangeStartDate ? subscribers : subscribers.filter((subscriber) => {
      // If no join date, include anyway
      if (!subscriber?.joined_at) return true;
      
      // Include if join date is after the time range start date
      const joinedAt = new Date(subscriber.joined_at);
      return joinedAt >= timeRangeStartDate;
    });
    
    // Calculate active subscribers (with active subscription)
    const activeSubscribers = filteredSubscribers.filter(
      (sub) => sub?.subscription_status === "active"
    );
    
    // Calculate inactive subscribers (without active subscription)
    const inactiveSubscribers = filteredSubscribers.filter(
      (sub) => sub?.subscription_status !== "active"
    );
    
    return {
      filteredSubscribers,
      activeSubscribers,
      inactiveSubscribers
    };
  }, [subscribers, timeRangeStartDate]);
};
