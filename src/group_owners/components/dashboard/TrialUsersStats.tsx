
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Clock, 
  Users, 
  Smartphone, 
  TrendingUp
} from "lucide-react";
import { TrialUsersData, MiniAppData } from "@/group_owners/hooks/useDashboardData";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 bg-white border-l-4 border-l-purple-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Trial Users</h3>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{trialUsers.count}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>{trialUsers.conversion}% conversion rate</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-cyan-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Mini App Users</h3>
            <Smartphone className="h-5 w-5 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{miniAppUsers.count}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>{miniAppUsers.nonSubscribers} pending subscriptions</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-rose-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Avg. Subscription Duration</h3>
            <Clock className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{averageSubscriptionDuration} days</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>Average member retention</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
