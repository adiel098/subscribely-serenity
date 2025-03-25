
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Clock, 
  Users
} from "lucide-react";
import { TrialUsersData } from "@/group_owners/hooks/dashboard/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrialUsersStatsProps {
  trialUsers: TrialUsersData;
  averageSubscriptionDuration: number;
}

export const TrialUsersStats: React.FC<TrialUsersStatsProps> = ({
  trialUsers,
  averageSubscriptionDuration
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'p-3' : 'p-5'} bg-white border-l-4 border-l-purple-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>Trial Users</h3>
          <Users className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-500`} />
        </div>
        <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-800`}>{trialUsers.count}</p>
        <div className="mt-auto pt-1">
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-medium flex items-center`}>
            <Clock className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} inline mr-0.5 text-purple-400`} /> 
            {averageSubscriptionDuration} days avg
          </span>
        </div>
      </div>
    </Card>
  );
};
