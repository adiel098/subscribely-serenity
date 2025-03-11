
import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import { TimeRange } from "./types";

export const useTimeRange = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const timeRangeStartDate = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return subDays(now, 7);
      case "30d":
        return subDays(now, 30);
      case "90d":
        return subDays(now, 90);
      case "all":
      default:
        return new Date(0); // Beginning of time
    }
  }, [timeRange]);
  
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 90 days";
      case "all":
        return "All time";
    }
  }, [timeRange]);

  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    timeRangeStartDate
  };
};
