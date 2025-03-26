import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeFilterProps {
  timeRange: "7d" | "30d" | "90d" | "all";
  onTimeRangeChange: (range: "7d" | "30d" | "90d" | "all") => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  timeRange,
  onTimeRangeChange,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center">
      <Select 
        value={timeRange} 
        onValueChange={(value) => onTimeRangeChange(value as "7d" | "30d" | "90d" | "all")}
      >
        <SelectTrigger className={`${isMobile ? 'w-[110px] h-8 text-xs' : 'w-[180px]'} bg-white border-gray-200`}>
          <div className="flex items-center">
            <CalendarDays className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'} text-gray-500`} />
            <SelectValue placeholder="Select Range" className={isMobile ? 'text-[11px]' : ''}>
              {timeRange === '7d' && '7 Days'}
              {timeRange === '30d' && '30 Days'}
              {timeRange === '90d' && '90 Days'}
              {timeRange === 'all' && 'All Time'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d" className={isMobile ? 'text-[11px]' : ''}>7 Days</SelectItem>
          <SelectItem value="30d" className={isMobile ? 'text-[11px]' : ''}>30 Days</SelectItem>
          <SelectItem value="90d" className={isMobile ? 'text-[11px]' : ''}>90 Days</SelectItem>
          <SelectItem value="all" className={isMobile ? 'text-[11px]' : ''}>All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
