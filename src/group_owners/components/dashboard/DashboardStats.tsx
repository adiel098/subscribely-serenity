
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  CalendarClock,
  ArrowUpRight
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Card className="p-6 bg-gradient-to-r from-white to-indigo-50 border-none rounded-xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Subscribers</h3>
            <div className="bg-indigo-100 p-2 rounded-full">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalSubscribers}</p>
          <div className="mt-auto pt-3 flex items-center text-xs text-indigo-600 font-medium">
            <CalendarClock className="h-3 w-3 mr-1" />
            <span>{timeRange}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-white to-green-50 border-none rounded-xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Subscribers</h3>
            <div className="bg-green-100 p-2 rounded-full">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeSubscribers}</p>
          <div className="mt-auto pt-3 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>{conversionRate.toFixed(1)}% conversion</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-white to-amber-50 border-none rounded-xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Inactive Subscribers</h3>
            <div className="bg-amber-100 p-2 rounded-full">
              <UserX className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{inactiveSubscribers}</p>
          <div className="mt-auto pt-3 flex items-center text-xs text-amber-600 font-medium">
            <CalendarClock className="h-3 w-3 mr-1" />
            <span>Expired subscriptions</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-white to-blue-50 border-none rounded-xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <div className="bg-blue-100 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
          <div className="mt-auto pt-3 flex items-center text-xs text-blue-600 font-medium">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>${avgRevenuePerSubscriber.toFixed(2)} / subscriber</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
