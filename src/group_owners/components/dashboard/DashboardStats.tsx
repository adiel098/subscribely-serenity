
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
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSubscribers,
  activeSubscribers,
  inactiveSubscribers,
  totalRevenue,
  avgRevenuePerSubscriber,
  conversionRate,
  timeRange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-5 bg-white border-l-4 border-l-indigo-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Total Subscribers</h3>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalSubscribers}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>{timeRange}</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-green-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Active Subscribers</h3>
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeSubscribers}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>{conversionRate.toFixed(1)}% conversion</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-amber-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Inactive Subscribers</h3>
            <UserX className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{inactiveSubscribers}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>Expired subscriptions</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200 shadow-sm rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
          <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">
            <span>${avgRevenuePerSubscriber.toFixed(2)} / subscriber</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
