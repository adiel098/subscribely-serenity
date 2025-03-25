
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Smartphone
} from "lucide-react";
import { MiniAppData } from "@/group_owners/hooks/dashboard/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface MiniAppUsersStatsProps {
  miniAppUsers: MiniAppData;
}

export const MiniAppUsersStats: React.FC<MiniAppUsersStatsProps> = ({
  miniAppUsers
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'p-3' : 'p-5'} bg-white border-l-4 border-l-cyan-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>Mini App Users</h3>
          <Smartphone className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-cyan-500`} />
        </div>
        <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-800`}>{miniAppUsers.count}</p>
        <div className="mt-auto pt-1">
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-medium`}>{miniAppUsers.nonSubscribers} non-subscribers</span>
        </div>
      </div>
    </Card>
  );
};
