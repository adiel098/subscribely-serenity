
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeRange } from "@/group_owners/hooks/dashboard/types";
import { CalendarIcon } from "lucide-react";

interface TimeFilterProps {
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  timeRange,
  onTimeRangeChange
}) => {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm">
      <CalendarIcon className="h-4 w-4 text-gray-500" />
      <Select
        value={timeRange}
        onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
      >
        <SelectTrigger className="w-[150px] border-none shadow-none h-8 focus:ring-0">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
