
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, ChevronDown } from "lucide-react";

type TimeRange = "7d" | "30d" | "90d" | "all";

interface TimeFilterProps {
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ 
  selectedTimeRange, 
  onTimeRangeChange 
}) => {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
      <CalendarRange className="h-4 w-4 text-indigo-500" />
      <Select
        value={selectedTimeRange}
        onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
      >
        <SelectTrigger className="border-0 p-1 h-8 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 w-[120px]">
          <SelectValue placeholder="Select range" />
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
