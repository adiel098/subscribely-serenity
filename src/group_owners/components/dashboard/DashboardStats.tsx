import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  UserCheck, 
  UserX
} from "lucide-react";

interface DashboardStatsProps {
  totalSubscribers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  totalRevenue: number;
  avgRevenuePerSubscriber: number;
  conversionRate: number;
  timeRange: string;
  isMobile?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSubscribers,
  activeSubscribers,
  inactiveSubscribers,
  totalRevenue,
  avgRevenuePerSubscriber,
  conversionRate,
  timeRange,
  isMobile = false
}) => {
  return (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
      <Card className={`${isMobile ? 'p-2' : 'p-5'} bg-white border-l-4 border-l-indigo-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600`}>Total Subscribers</h3>
            <Users className={`${isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-indigo-500`} />
          </div>
          <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-gray-800`}>{totalSubscribers}</p>
          <div className="mt-auto pt-0.5 md:pt-1">
            <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500 font-medium`}>{timeRange}</span>
          </div>
        </div>
      </Card>

      <Card className={`${isMobile ? 'p-2' : 'p-5'} bg-white border-l-4 border-l-green-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600`}>Active Subscribers</h3>
            <UserCheck className={`${isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-green-500`} />
          </div>
          <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-gray-800`}>{activeSubscribers}</p>
          <div className="mt-auto pt-0.5 md:pt-1">
            <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500 font-medium`}>{conversionRate.toFixed(1)}% conversion</span>
          </div>
        </div>
      </Card>

      <Card className={`${isMobile ? 'p-2' : 'p-5'} bg-white border-l-4 border-l-amber-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600`}>Inactive Subscribers</h3>
            <UserX className={`${isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-amber-500`} />
          </div>
          <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-gray-800`}>{inactiveSubscribers}</p>
          <div className="mt-auto pt-0.5 md:pt-1">
            <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500 font-medium`}>Expired subscriptions</span>
          </div>
        </div>
      </Card>

      <Card className={`${isMobile ? 'p-2' : 'p-5'} bg-white border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600`}>Total Revenue</h3>
            <CreditCard className={`${isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-blue-500`} />
          </div>
          <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-gray-800`}>${totalRevenue.toFixed(2)}</p>
          <div className="mt-auto pt-0.5 md:pt-1">
            <span className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-500 font-medium`}>${avgRevenuePerSubscriber.toFixed(2)} / sub</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
