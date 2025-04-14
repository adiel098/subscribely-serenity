import { useState, useMemo } from "react";
import { addDays, startOfDay, subDays, subMonths, format } from "date-fns";

/**
 * Hook to manage time range selection and calculations
 * @returns Object containing time range state and related data
 */
export const useTimeRange = () => {
  const [timeRange, setTimeRange] = useState<string>("last7days");

  // Calculate start date based on selected time range
  const timeRangeStartDate = useMemo(() => {
    const now = new Date();
    
    switch (timeRange) {
      case "today":
        return startOfDay(now);
      case "yesterday":
        return startOfDay(subDays(now, 1));
      case "last7days":
        return startOfDay(subDays(now, 7));
      case "last30days":
        return startOfDay(subDays(now, 30));
      case "thisMonth":
        return startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      case "lastMonth":
        return startOfDay(subMonths(now, 1));
      default:
        return startOfDay(subDays(now, 7)); // Default to last 7 days
    }
  }, [timeRange]);

  // Generate human-readable label for selected time range
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "last7days":
        return "Last 7 days";
      case "last30days":
        return "Last 30 days";
      case "thisMonth":
        return "This month";
      case "lastMonth":
        return "Last month";
      default:
        return "Last 7 days";
    }
  }, [timeRange]);

  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    timeRangeStartDate
  };
};
