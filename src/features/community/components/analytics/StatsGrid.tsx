import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Users, MessageSquare, DollarSign } from "lucide-react";

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalEvents} payments received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscribers}</div>
          <p className="text-xs text-muted-foreground">
            <ArrowUp className="h-4 w-4 text-green-500" /> +2.01% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notifications}</div>
          <p className="text-xs text-muted-foreground">
            <ArrowDown className="h-4 w-4 text-red-500" /> -7.68% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">
            <ArrowUp className="h-4 w-4 text-green-500" /> +12.24% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
