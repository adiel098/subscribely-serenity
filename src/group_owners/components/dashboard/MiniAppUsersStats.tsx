import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Smartphone
} from "lucide-react";
import { MiniAppData } from "@/group_owners/hooks/dashboard/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface MiniAppUsersStatsProps {
  miniAppUsers?: MiniAppData;
}

export const MiniAppUsersStats: React.FC<MiniAppUsersStatsProps> = ({
  miniAppUsers = { count: 0, nonSubscribers: 0 }
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'p-2' : 'p-5'} bg-white border-l-4 border-l-cyan-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg h-full`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <h3 className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600`}>Mini App Users</h3>
          <Smartphone className={`${isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-cyan-500`} />
        </div>
        <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-gray-800`}>{miniAppUsers.count}</p>
        <div className="mt-auto pt-0.5 md:pt-1">
          <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500 font-medium`}>{miniAppUsers.nonSubscribers} non-sub</span>
        </div>
      </div>
    </Card>
  );
};
