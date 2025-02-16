
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
  XCircle,
  MessageSquare,
  CircleDollarSign,
  AlertCircle
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
        </div>
        <p className="text-base text-muted-foreground">
          Manage your community subscribers and monitor their subscription status
        </p>
      </div>

      <div className="border rounded-lg shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription Period</TableHead>
              <TableHead>Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers?.map((subscriber) => (
              <TableRow key={subscriber.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      {subscriber.telegram_username ? (
                        <a
                          href={`https://t.me/${subscriber.telegram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          @{subscriber.telegram_username}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">No username</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Badge variant="secondary" className="font-mono">
                          {subscriber.telegram_user_id}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Telegram User ID</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {subscriber.plan ? (
                    <div className="flex items-center space-x-2">
                      <CircleDollarSign className="h-4 w-4 text-green-500" />
                      <div className="space-y-1">
                        <div className="font-medium">{subscriber.plan.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {subscriber.plan.interval} - ${subscriber.plan.price}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">No plan</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={subscriber.subscription_status ? "success" : "destructive"}
                    className={cn(
                      "flex items-center space-x-1",
                      subscriber.subscription_status ? "bg-green-100" : "bg-red-100"
                    )}
                  >
                    {subscriber.subscription_status ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>{subscriber.subscription_status ? "Active" : "Inactive"}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>
                        {subscriber.subscription_start_date
                          ? format(new Date(subscriber.subscription_start_date), "PP")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>
                        {subscriber.subscription_end_date
                          ? format(new Date(subscriber.subscription_end_date), "PP")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      <span>Joined: {format(new Date(subscriber.joined_at), "PP")}</span>
                    </div>
                    {subscriber.last_active && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last seen: {format(new Date(subscriber.last_active), "PP")}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subscribers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2" />
                    <p>No subscribers found</p>
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
