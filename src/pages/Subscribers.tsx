
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscribers } from "@/hooks/useSubscribers";
import { format } from "date-fns";
import { 
  Loader2, 
  Users,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Subscribers</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your community subscribers and monitor their subscription status
        </p>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">User</TableHead>
              <TableHead className="font-medium">Telegram ID</TableHead>
              <TableHead className="font-medium">Subscription Plan</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Subscription Period</TableHead>
              <TableHead className="font-medium">Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers && subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>
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
                          "No username"
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{subscriber.telegram_user_id}</TableCell>
                  <TableCell>
                    {subscriber.plan ? (
                      <>
                        <div className="font-medium">{subscriber.plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {subscriber.plan.interval} - ${subscriber.plan.price}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No plan</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscriber.subscription_status ? "success" : "destructive"}>
                      {subscriber.subscription_status ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {subscriber.subscription_start_date
                          ? format(new Date(subscriber.subscription_start_date), "PPp")
                          : "-"}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {subscriber.subscription_end_date
                          ? format(new Date(subscriber.subscription_end_date), "PPp")
                          : "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Joined: {format(new Date(subscriber.joined_at), "PPp")}
                      </div>
                      {subscriber.last_active && (
                        <div className="text-sm text-muted-foreground">
                          Last active: {format(new Date(subscriber.last_active), "PPp")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No subscribers found</p>
                  </div>
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
