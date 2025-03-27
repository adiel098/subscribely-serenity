
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  MoreHorizontal, 
  User, 
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Unlock,
  ExternalLink,
  UserPlus,
  Clock
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
  onAssignPlan?: (subscriber: Subscriber) => void;
}

export const SubscribersTable = ({ 
  subscribers, 
  onEdit, 
  onRemove,
  onUnblock,
  onAssignPlan
}: SubscribersTableProps) => {
  const isMobile = useIsMobile();
  const getStatusBadge = (subscriber: Subscriber) => {
    // First check subscription_status
    if (subscriber.subscription_status === "active") {
      return (
        <Badge variant="success" className="text-xs py-0.5 px-2.5 gap-1 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          <span>Active</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "expired") {
      return (
        <Badge variant="warning" className="text-xs py-0.5 px-2.5 gap-1 font-medium bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3" />
          <span>Expired</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "removed") {
      return (
        <Badge variant="destructive" className="text-xs py-0.5 px-2.5 gap-1 font-medium">
          <XCircle className="h-3 w-3" />
          <span>Removed</span>
        </Badge>
      );
    } 
    // Only if subscription_status doesn't provide useful information, check is_active
    else if (!subscriber.is_active) {
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
    <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
      <div className="overflow-auto max-h-[calc(100vh-335px)]">
        <Table className={`w-full ${!isMobile && 'pl-[240px] pr-6'}`}>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b">
              <TableHead className="font-semibold text-xs text-gray-700">User</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Telegram ID</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Subscription Plan</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700 text-left">Subscription Period</TableHead>
              <TableHead className="w-[80px] text-right font-semibold text-xs text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow 
                  key={subscriber.id}
                  className="hover:bg-gray-50 transition-colors border-b group"
                >
                  {/* User cell */}
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {subscriber.telegram_username ? (
                            <a
                              href={`https://t.me/${subscriber.telegram_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
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
                  
                  {/* Name cell */}
                  <TableCell className="py-3">
                    <div className="font-medium text-sm text-gray-800">
                      {subscriber.first_name || "-"}
                      {subscriber.first_name && subscriber.last_name && " "}
                      {subscriber.last_name || ""}
                    </div>
                  </TableCell>
                  
                  {/* Telegram ID cell */}
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
                  
                  {/* Subscription Plan cell */}
                  <TableCell className="py-3">
                    {subscriber.plan ? (
                      <div>
                        <div className="font-medium text-sm text-gray-800">{subscriber.plan.name}</div>
                        <div className="text-xs text-gray-500">
                          {subscriber.plan.interval} • ${subscriber.plan.price}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No plan</span>
                    )}
                  </TableCell>
                  
                  {/* Status cell */}
                  <TableCell className="py-3">
                    {getStatusBadge(subscriber)}
                  </TableCell>
                  
                  {/* Subscription Period cell */}
                  <TableCell className="py-3 text-left">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <span className="text-gray-600 text-left">
                          From: {subscriber.subscription_start_date
                            ? format(new Date(subscriber.subscription_start_date), "MMM d, yyyy")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 text-left">
                          Until: {subscriber.subscription_end_date
                            ? format(new Date(subscriber.subscription_end_date), "MMM d, yyyy")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Actions cell */}
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => onEdit(subscriber)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                            Edit Subscriber
                          </DropdownMenuItem>
                          
                          {!subscriber.plan && onAssignPlan && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => onAssignPlan(subscriber)}
                            >
                              <UserPlus className="mr-2 h-4 w-4 text-amber-600" />
                              Assign Plan
                            </DropdownMenuItem>
                          )}
                          
                          {subscriber.subscription_status === "removed" ? (
                            <DropdownMenuItem
                              className="text-blue-600 focus:text-blue-600 cursor-pointer"
                              onClick={() => onUnblock(subscriber)}
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer"
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
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Users className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-lg font-medium mb-2 text-gray-700">No subscribers found</p>
                    <p className="text-sm text-gray-500 max-w-md">
                      No subscribers match your current filters. Try changing your search criteria.
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
