import { useMemo } from "react";

/**
 * Hook to filter subscribers based on time range and status
 * @param subscribers - Array of subscriber objects
 * @param timeRangeStartDate - Optional start date to filter subscribers by join date
 * @returns Object containing filtered subscribers arrays
 */
export const useFilteredSubscribers = (subscribers: any[] = [], timeRangeStartDate: Date | null) => {
  return useMemo(() => {
    // Create default empty return value
    const emptyResult = {
      filteredSubscribers: [],
      activeSubscribers: [],
      inactiveSubscribers: []
    };
    
    // Safety check to ensure subscribers is an array
    if (!Array.isArray(subscribers)) {
      console.warn("useFilteredSubscribers received non-array subscribers input:", subscribers);
      return emptyResult;
    }
    
    // If subscribers array is empty, return empty result early
    if (subscribers.length === 0) {
      return emptyResult;
    }
    
    try {
      // Filter subscribers based on time range
      const filteredSubscribers = !timeRangeStartDate ? subscribers : subscribers.filter((subscriber) => {
        // Skip invalid subscribers
        if (!subscriber || typeof subscriber !== 'object') return false;
        
        // If no join date, include anyway
        if (!subscriber?.joined_at) return true;
        
        try {
          // Include if join date is after the time range start date
          const joinedAt = new Date(subscriber.joined_at);
          return joinedAt >= timeRangeStartDate;
        } catch (error) {
          // If date parsing fails, include subscriber anyway
          console.warn("Failed to parse joined_at date:", subscriber.joined_at);
          return true;
        }
      });
      
      // Calculate active subscribers (with active subscription)
      const activeSubscribers = filteredSubscribers.filter(
        (sub) => sub && typeof sub === 'object' && sub?.subscription_status === "active"
      );
      
      // Calculate inactive subscribers (without active subscription)
      const inactiveSubscribers = filteredSubscribers.filter(
        (sub) => sub && typeof sub === 'object' && sub?.subscription_status !== "active"
      );
      
      return {
        filteredSubscribers,
        activeSubscribers,
        inactiveSubscribers
      };
    } catch (error) {
      console.error("Error in useFilteredSubscribers:", error);
      return emptyResult;
    }
  }, [subscribers, timeRangeStartDate]);
};
