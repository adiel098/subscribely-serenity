import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useBroadcastStats } from "@/hooks/useBroadcastStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Loader2, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface BroadcastStats {
  messagesSent?: number;
  newSubscribers?: number;
  unsubscribers?: number;
}

interface StatCardProps {
  title: string;
  value: number | undefined;
  isLoading: boolean;
  icon: React.ReactNode;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, isLoading, icon, isPositive }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <div className="text-2xl font-bold">
            {value?.toLocaleString() || 0}
            {isPositive !== undefined && (
              <span className="ml-2 text-sm text-green-500">
                {isPositive ? <ArrowUp className="inline-block h-4 w-4 mr-1" /> : <ArrowDown className="inline-block h-4 w-4 mr-1" />}
                {isPositive ? "Increase" : "Decrease"}
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Loading..." : "Compared to last period"}
        </p>
      </CardContent>
    </Card>
  );
};

export const BroadcastStats = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: stats, isLoading } = useBroadcastStats(selectedCommunityId || "");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Messages Sent"
        value={stats?.messagesSent}
        isLoading={isLoading}
        icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="New Subscribers"
        value={stats?.newSubscribers}
        isLoading={isLoading}
        isPositive={true}
        icon={<ArrowUp className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Unsubscribers"
        value={stats?.unsubscribers}
        isLoading={isLoading}
        isPositive={false}
        icon={<ArrowDown className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};
