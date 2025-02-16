
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
import { Subscriber } from "@/hooks/useSubscribers";

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
}

export const SubscribersTable = ({ subscribers, onEdit, onRemove }: SubscribersTableProps) => {
  return (
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
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length > 0 ? (
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
                      Start: {subscriber.subscription_start_date
                        ? format(new Date(subscriber.subscription_start_date), "PPp")
                        : "-"}
                    </div>
                    <div className="flex items-center text-sm">
                      End: {subscriber.subscription_end_date
                        ? format(new Date(subscriber.subscription_end_date), "PPp")
                        : "-"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    Joined: {format(new Date(subscriber.joined_at), "PPp")}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
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
