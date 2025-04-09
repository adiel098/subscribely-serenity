
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, Box, Smartphone } from "lucide-react";

interface MetricsGridProps {
  activeSubscribers: any[];
  inactiveSubscribers: any[];
  totalRevenue: number;
  avgRevenuePerSubscriber: number;
  conversionRate: number;
  trialUsers: { count: number; percentage: number };
  miniAppUsers: { count: number; nonSubscribers: number };
  paymentStats: any;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  activeSubscribers,
  inactiveSubscribers,
  totalRevenue,
  avgRevenuePerSubscriber,
  conversionRate,
  trialUsers,
  miniAppUsers
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Active Subscribers"
        value={activeSubscribers.length}
        icon={<Users className="h-5 w-5 text-blue-600" />}
        description={`${inactiveSubscribers.length} inactive`}
        trend={activeSubscribers.length > 0 ? "up" : "neutral"}
      />
      
      <MetricCard
        title="Total Revenue"
        value={`$${totalRevenue.toFixed(2)}`}
        icon={<CreditCard className="h-5 w-5 text-green-600" />}
        description={`$${avgRevenuePerSubscriber.toFixed(2)} per user`}
        trend={totalRevenue > 0 ? "up" : "neutral"}
      />
      
      <MetricCard
        title="Conversion Rate"
        value={`${conversionRate.toFixed(1)}%`}
        icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
        description={`${trialUsers.count} trial users (${trialUsers.percentage.toFixed(1)}%)`}
        trend={conversionRate > 0 ? "up" : "neutral"}
      />
      
      <MetricCard
        title="Mini App Users"
        value={miniAppUsers.count}
        icon={<Smartphone className="h-5 w-5 text-purple-600" />}
        description={`${miniAppUsers.nonSubscribers} non-subscribers`}
        trend={miniAppUsers.count > 0 ? "up" : "neutral"}
      />
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: "up" | "down" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend = "neutral" 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
