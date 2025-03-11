
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Smartphone, 
  TrendingUp
} from "lucide-react";
import { TrialUsersData, MiniAppData } from "@/group_owners/hooks/dashboard/types";

interface TrialUsersStatsProps {
  trialUsers: TrialUsersData;
  miniAppUsers: MiniAppData;
  averageSubscriptionDuration: number;
}

export const TrialUsersStats: React.FC<TrialUsersStatsProps> = ({
  trialUsers,
  miniAppUsers,
  averageSubscriptionDuration
}) => {
  return (
    <Card className="p-5 bg-white border-l-4 border-l-purple-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">Trial Users</h3>
          <Users className="h-5 w-5 text-purple-500" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{trialUsers.count}</p>
        <div className="mt-2 pt-2 text-xs text-gray-500 font-medium">
          <span>{trialUsers.conversion}% conversion rate</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Mini App Users</span>
            <Smartphone className="h-4 w-4 text-cyan-500" />
          </div>
          <span className="text-sm font-semibold text-gray-700">{miniAppUsers.count}</span>
        </div>
      </div>
    </Card>
  );
};
