
import { Globe, TrendingUp, Building, UserCheck, Users, DollarSign, CreditCard } from "lucide-react";
import { StatisticCard } from "./StatisticCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminStatistics } from "@/admin/hooks/useAdminStatistics";

interface StatisticsGridProps {
  statistics: AdminStatistics | undefined;
  isLoading: boolean;
  error: Error | null;
  formatCurrency: (value: number) => string;
}

export const StatisticsGrid = ({ statistics, isLoading, error, formatCurrency }: StatisticsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="hover-scale border-gray-100 shadow-sm">
            <CardSkeleton />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-500">Error loading dashboard statistics. Please try again later.</p>
      </Card>
    );
  }

  // Split the stats cards into two rows
  return (
    <div className="space-y-6">
      {/* First row - 3 cards */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <StatisticCard
          title="Total Communities"
          value={statistics?.totalCommunities || 0}
          icon={Globe}
          iconColor="text-indigo-500"
          description="Platform-wide communities"
          descriptionIcon={TrendingUp}
          descriptionIconColor="text-green-500"
          borderColor="border-indigo-100"
        />
        
        <StatisticCard
          title="Community Owners"
          value={statistics?.totalOwners || 0}
          icon={Building}
          iconColor="text-blue-500"
          description={`${statistics?.activeSubscribedOwners || 0} with active subscriptions`}
          descriptionIcon={UserCheck}
          descriptionIconColor="text-blue-500"
          borderColor="border-blue-100"
        />
        
        <StatisticCard
          title="Subscribed Owners"
          value={statistics?.activeSubscribedOwners || 0}
          icon={UserCheck}
          iconColor="text-purple-500"
          description={
            statistics?.totalOwners && statistics.totalOwners > 0
              ? `${Math.round((statistics.activeSubscribedOwners / statistics.totalOwners) * 100)}% of owners`
              : "No owners registered yet"
          }
          descriptionIcon={statistics?.totalOwners && statistics.totalOwners > 0 ? TrendingUp : undefined}
          descriptionIconColor="text-green-500"
          borderColor="border-purple-100"
        />
      </div>

      {/* Second row - 3 cards */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <StatisticCard
          title="Community Members"
          value={statistics?.totalMembersInCommunities || 0}
          icon={Users}
          iconColor="text-green-500"
          description="Across all communities"
          descriptionIcon={TrendingUp}
          descriptionIconColor="text-green-500"
          borderColor="border-green-100"
        />
        
        <StatisticCard
          title="Community Revenue"
          value={formatCurrency(statistics?.totalCommunityRevenue || 0)}
          icon={DollarSign}
          iconColor="text-orange-500"
          description="Total payments to communities"
          descriptionIcon={TrendingUp}
          descriptionIconColor="text-green-500"
          borderColor="border-orange-100"
        />
        
        <StatisticCard
          title="Platform Revenue"
          value={formatCurrency(statistics?.totalPlatformRevenue || 0)}
          icon={CreditCard}
          iconColor="text-pink-500"
          description="Total payments to platform"
          descriptionIcon={TrendingUp}
          descriptionIconColor="text-green-500"
          borderColor="border-pink-100"
        />
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <>
    <Skeleton className="h-5 w-32 mx-6 mt-6 mb-2" />
    <Skeleton className="h-5 w-5 rounded-full absolute top-6 right-6" />
    <Skeleton className="h-8 w-20 mx-6 mb-1" />
    <Skeleton className="h-4 w-24 mx-6 mb-6" />
  </>
);
