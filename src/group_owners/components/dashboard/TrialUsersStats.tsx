import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Clock, 
  Users
} from "lucide-react";
import { TrialUsersData } from "@/group_owners/hooks/dashboard/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrialUsersStatsProps {
  trialUsers?: TrialUsersData;
  averageSubscriptionDuration?: number;
}

export const TrialUsersStats: React.FC<TrialUsersStatsProps> = ({
  trialUsers = { count: 0, percentage: 0 },
  averageSubscriptionDuration = 0
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'p-2' : 'p-5'} bg-white border-l-4 border-l-purple-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg h-full`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <h3 className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600`}>Trial Users</h3>
          <Users className={`${isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-purple-500`} />
        </div>
        <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-gray-800`}>{trialUsers.count}</p>
        <div className="mt-auto pt-0.5 md:pt-1">
          <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500 font-medium flex items-center`}>
            <Clock className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} inline mr-0.5 text-purple-400`} /> 
            {trialUsers.percentage.toFixed(1)}% of all subscribers
          </span>
        </div>
      </div>
    </Card>
  );
};
