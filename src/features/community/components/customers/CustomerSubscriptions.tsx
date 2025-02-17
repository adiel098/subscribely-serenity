
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { Badge } from "@/features/community/components/ui/badge";
import { ScrollArea } from "@/features/community/components/ui/scroll-area";

export interface CustomerSubscriptionsProps {
  customerId: string;
}

export const CustomerSubscriptions = ({ customerId }: CustomerSubscriptionsProps) => {
  const { data: subscriptions } = useQuery({
    queryKey: ['customerSubscriptions', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          created_at,
          plan:subscription_plans (
            name,
            price,
            interval
          )
        `)
        .eq('user_id', customerId);

      if (error) throw error;
      return data || [];
    }
  });

  if (!subscriptions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active subscriptions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{subscription.plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${subscription.plan.price}/{subscription.plan.interval}
                  </p>
                </div>
                <Badge 
                  variant={subscription.status === 'active' ? "success" : "destructive"}
                >
                  {subscription.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
