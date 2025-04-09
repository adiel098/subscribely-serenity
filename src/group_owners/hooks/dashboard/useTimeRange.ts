
import { useState } from "react";
import { subDays } from "date-fns";

export const useTimeRange = () => {
  const [timeRange, setTimeRange] = useState<string>("all");
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      case "1y": return "Last year";
      default: return "All time";
    }
  };
  
  const getTimeRangeStartDate = () => {
    const now = new Date();
    
    switch (timeRange) {
      case "7d": return subDays(now, 7);
      case "30d": return subDays(now, 30);
      case "90d": return subDays(now, 90);
      case "1y": return subDays(now, 365);
      default: return null; // All time
    }
  };
  
  return {
    timeRange,
    setTimeRange,
    timeRangeLabel: getTimeRangeLabel(),
    timeRangeStartDate: getTimeRangeStartDate()
  };
};
