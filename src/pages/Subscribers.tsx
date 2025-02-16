
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscribers } from "@/hooks/useSubscribers";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading } = useSubscribers(selectedCommunityId || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscribers</h1>
        <p className="text-sm text-muted-foreground">
          Manage your community subscribers and their subscription status
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers?.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>
                  {subscriber.telegram_username ? (
                    <a
                      href={`https://t.me/${subscriber.telegram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{subscriber.telegram_username}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No username</span>
                  )}
                </TableCell>
                <TableCell>{subscriber.telegram_user_id}</TableCell>
                <TableCell>
                  {subscriber.plan ? (
                    <div className="space-y-1">
                      <div>{subscriber.plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {subscriber.plan.interval} - ${subscriber.plan.price}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No plan</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={subscriber.subscription_status ? "success" : "destructive"}
                  >
                    {subscriber.subscription_status ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {subscriber.subscription_start_date
                    ? format(new Date(subscriber.subscription_start_date), "PP")
                    : "-"}
                </TableCell>
                <TableCell>
                  {subscriber.subscription_end_date
                    ? format(new Date(subscriber.subscription_end_date), "PP")
                    : "-"}
                </TableCell>
                <TableCell>
                  {format(new Date(subscriber.joined_at), "PP")}
                </TableCell>
                <TableCell>
                  {subscriber.last_active
                    ? format(new Date(subscriber.last_active), "PP")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
            {subscribers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No subscribers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Subscribers;
