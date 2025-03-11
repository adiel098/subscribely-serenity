
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange } from "lucide-react";

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
    <div className="flex items-center gap-2 bg-white py-2 px-3 rounded-lg shadow-sm border border-indigo-100">
      <div className="bg-indigo-100 p-1.5 rounded-md">
        <CalendarRange className="h-4 w-4 text-indigo-600" />
      </div>
      <Select
        value={selectedTimeRange}
        onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
      >
        <SelectTrigger className="border-0 bg-transparent p-1 h-8 focus:ring-0 focus:ring-offset-0 w-[130px] font-medium text-gray-700">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent className="border border-indigo-100">
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
