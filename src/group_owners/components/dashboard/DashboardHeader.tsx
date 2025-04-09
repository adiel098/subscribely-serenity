
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardHeaderProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  timeRangeLabel: string;
  isProject: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeRange,
  setTimeRange,
  timeRangeLabel,
  isProject
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {isProject ? "Project Dashboard" : "Community Dashboard"}
        </h1>
        <p className="text-gray-500 mt-1">
          Overview of your {isProject ? "project" : "community"}'s performance
        </p>
      </div>
      
      <div className="w-36">
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={timeRangeLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
