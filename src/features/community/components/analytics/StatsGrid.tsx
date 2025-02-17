import { Card, CardContent, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { CreditCard, Users, Bell, Activity } from "lucide-react";

interface StatsGridProps {
  totalRevenue: number;
  activeSubscribers: number;
  notifications: number;
  totalMembers: number;
  totalEvents: number;
}

export const StatsGrid = ({ 
  totalRevenue, 
  activeSubscribers, 
  notifications, 
  totalMembers,
  totalEvents
}: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue}</div>
          <div className="text-xs text-gray-500">All time</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscribers}</div>
          <div className="text-xs text-gray-500">
            out of {totalMembers} members
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          <Bell className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notifications}</div>
          <div className="text-xs text-gray-500">via bot</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity</CardTitle>
          <Activity className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <div className="text-xs text-gray-500">events recorded</div>
        </CardContent>
      </Card>
    </div>
  );
};
