
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  User, 
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
}

export const SubscribersTable = ({ subscribers, onEdit, onRemove }: SubscribersTableProps) => {
  const getStatusBadge = (subscriber: Subscriber) => {
    if (!subscriber.is_active) {
      return (
        <Badge variant="destructive" className="text-xs py-0.5">
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Removed
          </span>
        </Badge>
      );
    } else if (subscriber.subscription_status) {
      return (
        <Badge variant="success" className="text-xs py-0.5">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="warning" className="text-xs py-0.5">
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Inactive
          </span>
        </Badge>
      );
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-auto max-h-[calc(100vh-220px)]">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium text-xs">User</TableHead>
            <TableHead className="font-medium text-xs">Telegram ID</TableHead>
            <TableHead className="font-medium text-xs">Subscription Plan</TableHead>
            <TableHead className="font-medium text-xs">Status</TableHead>
            <TableHead className="font-medium text-xs">Subscription Period</TableHead>
            <TableHead className="font-medium text-xs">Activity</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length > 0 ? (
            subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="py-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-xs">
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
                <TableCell className="font-mono text-xs py-2">{subscriber.telegram_user_id}</TableCell>
                <TableCell className="py-2">
                  {subscriber.plan ? (
                    <>
                      <div className="font-medium text-xs">{subscriber.plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {subscriber.plan.interval} - ${subscriber.plan.price}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">No plan</span>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  {getStatusBadge(subscriber)}
                </TableCell>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      Start: {subscriber.subscription_start_date
                        ? format(new Date(subscriber.subscription_start_date), "PP")
                        : "-"}
                    </div>
                    <div className="flex items-center text-xs">
                      End: {subscriber.subscription_end_date
                        ? format(new Date(subscriber.subscription_end_date), "PP")
                        : "-"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="text-xs">
                    Joined: {format(new Date(subscriber.joined_at), "PP")}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-7 w-7 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(subscriber)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => onRemove(subscriber)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove Subscriber
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
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
  );
};
