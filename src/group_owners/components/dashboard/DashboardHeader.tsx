import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardHeaderProps {
  subscribers?: any[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  timeRangeLabel: string;
  isProject: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  subscribers,
  timeRange,
  setTimeRange,
  timeRangeLabel,
  isProject
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
      <div className="mb-4 sm:mb-0">
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
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="last90days">Last 90 days</SelectItem>
            <SelectItem value="lastYear">Last year</SelectItem>
            <SelectItem value="allTime">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
