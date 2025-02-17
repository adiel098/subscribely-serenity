
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Community {
  id: string;
  name: string;
}

interface CustomerSubscriptionsProps {
  communities: Community[];
}

interface Subscription {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  payment_method: string;
  community: {
    name: string;
  };
  plan: {
    name: string;
    interval: string;
  };
}

export const CustomerSubscriptions = ({ communities }: CustomerSubscriptionsProps) => {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['customer-subscriptions', communities.map(c => c.id)],
    queryFn: async () => {
      if (communities.length === 0) return [];

      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          community:communities(name),
          plan:subscription_plans(name, interval)
        `)
        .in('community_id', communities.map(c => c.id))
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
    enabled: communities.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (!subscriptions?.length) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
          <CreditCard className="h-8 w-8 mb-4" />
          <p>No subscription history found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>
            View all subscription payments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {subscription.community?.name}
                    </span>
                    <Badge variant="outline">
                      {subscription.plan?.name} - {subscription.plan?.interval}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(subscription.created_at), 'PPp')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${subscription.amount}</div>
                  <div className="text-sm">
                    <Badge
                      variant={
                        subscription.status === 'completed'
                          ? 'default'
                          : subscription.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
