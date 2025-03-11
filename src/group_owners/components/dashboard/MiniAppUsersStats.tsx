
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Smartphone
} from "lucide-react";
import { MiniAppData } from "@/group_owners/hooks/dashboard/types";

interface MiniAppUsersStatsProps {
  miniAppUsers: MiniAppData;
}

export const MiniAppUsersStats: React.FC<MiniAppUsersStatsProps> = ({
  miniAppUsers
}) => {
  return (
    <Card className="p-5 bg-white border-l-4 border-l-cyan-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">Mini App Users</h3>
          <Smartphone className="h-5 w-5 text-cyan-500" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{miniAppUsers.count}</p>
        <div className="mt-2 pt-2 text-xs text-gray-500 font-medium">
          <span>{miniAppUsers.nonSubscribers} non-subscribers</span>
        </div>
      </div>
    </Card>
  );
};
