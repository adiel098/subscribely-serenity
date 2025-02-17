
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { Badge } from "@/features/community/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface CustomerSubscriptionsProps {
  data: {
    subscriptions: Array<{
      id: string;
      plan_name: string;
      status: "active" | "expired" | "cancelled";
      start_date: string;
      end_date: string | null;
      price: number;
      community_name: string;
    }>;
  };
}

export const CustomerSubscriptions = ({ data }: CustomerSubscriptionsProps) => {
  if (!data.subscriptions?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subscriptions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{subscription.plan_name}</CardTitle>
                <CardDescription>{subscription.community_name}</CardDescription>
              </div>
              <Badge
                variant={
                  subscription.status === "active"
                    ? "success"
                    : subscription.status === "expired"
                    ? "destructive"
                    : "secondary"
                }
              >
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(subscription.start_date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {subscription.end_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Date
                  </p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(subscription.end_date), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
