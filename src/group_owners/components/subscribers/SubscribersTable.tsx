
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  User, 
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Unlock,
  Calendar,
  MessageSquare,
  Crown,
  Clock,
  ExternalLink
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock: (subscriber: Subscriber) => void;
}

export const SubscribersTable = ({ 
  subscribers, 
  onEdit, 
  onRemove,
  onUnblock 
}: SubscribersTableProps) => {
  const getStatusBadge = (subscriber: Subscriber) => {
    if (!subscriber.is_active) {
      return (
        <Badge variant="destructive" className="text-xs py-0.5 px-2.5 gap-1 font-medium">
          <XCircle className="h-3 w-3" />
          <span>Removed</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "active") {
      return (
        <Badge variant="success" className="text-xs py-0.5 px-2.5 gap-1 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          <span>Active</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "removed") {
      return (
        <Badge variant="destructive" className="text-xs py-0.5 px-2.5 gap-1 font-medium">
          <XCircle className="h-3 w-3" />
          <span>Removed</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="warning" className="text-xs py-0.5 px-2.5 gap-1 font-medium">
          <XCircle className="h-3 w-3" />
          <span>Inactive</span>
        </Badge>
      );
    }
  };

  return (
    <div className="rounded-lg border border-indigo-100 shadow-sm overflow-hidden bg-white">
      <div className="overflow-auto max-h-[calc(100vh-335px)]">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <TableHead className="font-semibold text-xs text-indigo-700">User</TableHead>
              <TableHead className="font-semibold text-xs text-indigo-700">Name</TableHead>
              <TableHead className="font-semibold text-xs text-indigo-700">Telegram ID</TableHead>
              <TableHead className="font-semibold text-xs text-indigo-700">Subscription Plan</TableHead>
              <TableHead className="font-semibold text-xs text-indigo-700">Status</TableHead>
              <TableHead className="font-semibold text-xs text-indigo-700">Subscription Period</TableHead>
              <TableHead className="font-semibold text-xs text-indigo-700">Activity</TableHead>
              <TableHead className="w-[80px] text-right font-semibold text-xs text-indigo-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow 
                  key={subscriber.id}
                  className="hover:bg-indigo-50/30 transition-colors border-b border-indigo-50 group"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-medium border border-indigo-200">
                        {subscriber.telegram_username ? (
                          subscriber.telegram_username.substring(0, 1).toUpperCase()
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {subscriber.telegram_username ? (
                            <a
                              href={`https://t.me/${subscriber.telegram_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
                            >
                              @{subscriber.telegram_username}
                              <ExternalLink className="h-3 w-3 ml-1.5 opacity-50" />
                            </a>
                          ) : (
                            "No username"
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {format(new Date(subscriber.joined_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-sm text-gray-800">
                      {subscriber.first_name || "-"}
                      {subscriber.first_name && subscriber.last_name && " "}
                      {subscriber.last_name || ""}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs py-3 text-gray-600">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">{subscriber.telegram_user_id}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Telegram User ID</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="py-3">
                    {subscriber.plan ? (
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Crown className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                          <span className="font-semibold text-sm text-gray-800">{subscriber.plan.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="capitalize">{subscriber.plan.interval}</span>
                          <span className="mx-1.5 text-gray-400">•</span>
                          <span className="font-medium text-indigo-600">${subscriber.plan.price}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No plan</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(subscriber)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        <span className="text-gray-600">
                          From: <span className="font-medium text-gray-800">
                            {subscriber.subscription_start_date
                              ? format(new Date(subscriber.subscription_start_date), "MMM d, yyyy")
                              : "-"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                        <span className="text-gray-600">
                          Until: <span className="font-medium text-gray-800">
                            {subscriber.subscription_end_date
                              ? format(new Date(subscriber.subscription_end_date), "MMM d, yyyy")
                              : "-"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs">
                      <div className="flex items-center mb-1">
                        <MessageSquare className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                        <span className="text-gray-600">
                          Messages: <span className="font-medium text-gray-800">{subscriber.total_messages || 0}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                        <span className="text-gray-600">
                          Last active: <span className="font-medium text-gray-800">
                            {subscriber.last_active 
                              ? format(new Date(subscriber.last_active), "MMM d, yyyy")
                              : "Never"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 border-indigo-100">
                          <DropdownMenuItem 
                            onClick={() => onEdit(subscriber)}
                            className="cursor-pointer hover:bg-indigo-50"
                          >
                            <Pencil className="mr-2 h-4 w-4 text-indigo-600" />
                            Edit Subscriber
                          </DropdownMenuItem>
                          
                          {/* Show remove or unblock based on current status */}
                          {subscriber.subscription_status === "removed" ? (
                            <DropdownMenuItem
                              className="text-blue-600 focus:text-blue-600 cursor-pointer hover:bg-blue-50"
                              onClick={() => onUnblock(subscriber)}
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50"
                              onClick={() => onRemove(subscriber)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Remove Subscriber
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="h-20 w-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
                      <Users className="h-10 w-10 text-indigo-300" />
                    </div>
                    <p className="text-lg font-medium mb-2 text-gray-700">No subscribers found</p>
                    <p className="text-sm text-gray-500 max-w-md">
                      No subscribers match your current filters. Try changing your search criteria or add new subscribers to your community.
                    </p>
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
