
import React from "react";
import { format } from "date-fns";
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

interface MobileSubscribersListProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock?: (subscriber: Subscriber) => void;
  onAssignPlan?: (subscriber: Subscriber) => void;
}

export const MobileSubscribersList: React.FC<MobileSubscribersListProps> = ({
  subscribers,
  onEdit,
  onRemove,
  onUnblock,
  onAssignPlan
}) => {
  const getStatusBadge = (subscriber: Subscriber) => {
    // First check subscription_status
    if (subscriber.subscription_status === "active") {
      return (
        <Badge variant="success" className="text-[0.5rem] py-0 px-1 gap-0.5 font-medium h-[14px]">
          <CheckCircle2 className="h-1.5 w-1.5" />
          <span>Active</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "expired") {
      return (
        <Badge variant="warning" className="text-[0.5rem] py-0 px-1 gap-0.5 font-medium h-[14px] bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-1.5 w-1.5" />
          <span>Expired</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "removed") {
      return (
        <Badge variant="destructive" className="text-[0.5rem] py-0 px-1 gap-0.5 font-medium h-[14px]">
          <XCircle className="h-1.5 w-1.5" />
          <span>Removed</span>
        </Badge>
      );
    } 
    // Only if subscription_status doesn't provide useful information, check is_active
    else if (!subscriber.is_active) {
      return (
        <Badge variant="destructive" className="text-[0.5rem] py-0 px-1 gap-0.5 font-medium h-[14px]">
          <XCircle className="h-1.5 w-1.5" />
          <span>Removed</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="warning" className="text-[0.5rem] py-0 px-1 gap-0.5 font-medium h-[14px]">
          <XCircle className="h-1.5 w-1.5" />
          <span>Inactive</span>
        </Badge>
      );
    }
  };

  if (subscribers.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground text-xs">
        No subscribers found
      </div>
    );
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
      <div className="overflow-x-auto px-4">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-b hover:bg-transparent">
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[100px] px-1.5">User</TableHead>
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[70px] px-1.5">Name</TableHead>
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[60px] px-1.5">ID</TableHead>
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[80px] px-1.5">Plan</TableHead>
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[60px] px-1.5">Status</TableHead>
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[90px] px-1.5 hidden md:table-cell">Period</TableHead>
              <TableHead className="font-semibold text-[0.6rem] text-gray-700 w-[60px] px-1.5 md:hidden">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow 
                key={subscriber.id}
                className="hover:bg-gray-50/50 transition-colors border-b group relative cursor-pointer md:cursor-default"
              >
                <TableCell className="py-1 px-1.5 relative">
                  <div className="flex items-center space-x-1">
                    <div>
                      <p className="text-[0.3rem] font-medium text-gray-800 truncate max-w-[70px]">
                        {subscriber.telegram_username ? (
                          <a
                            href={`https://t.me/${subscriber.telegram_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                          >
                            @{subscriber.telegram_username}
                            <ExternalLink className="h-0.5 w-0.5 ml-0.5 opacity-50" />
                          </a>
                        ) : (
                          "No username"
                        )}
                      </p>

                      <p className="text-[0.45rem] text-gray-500 flex items-center gap-0.5 whitespace-nowrap">
                        <Clock className="h-1.5 w-1.5 shrink-0" />
                        {format(new Date(subscriber.joined_at), "d/M/yy")}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-1 px-1.5">
                  <div className="text-[0.55rem] font-medium text-gray-800 truncate max-w-[60px]">
                    {subscriber.first_name || "-"}
                    {subscriber.first_name && subscriber.last_name && " "}
                    {subscriber.last_name || ""}
                  </div>
                </TableCell>

                <TableCell className="py-1 px-1.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-mono text-[0.5rem] text-gray-600 cursor-help truncate max-w-[50px]">
                          {subscriber.telegram_user_id}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[0.6rem]">{subscriber.telegram_user_id}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                <TableCell className="py-1 px-1.5">
                  {subscriber.plan ? (
                    <div>
                      <div className="text-[0.55rem] font-medium text-gray-800 truncate max-w-[70px]">{subscriber.plan.name}</div>
                      <div className="text-[0.5rem] text-gray-500 whitespace-nowrap">
                        {subscriber.plan.interval.slice(0,2)} • ${subscriber.plan.price}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-[0.5rem] italic">-</span>
                  )}
                </TableCell>

                <TableCell className="py-1 px-1.5">
                  {getStatusBadge(subscriber)}
                </TableCell>

                <TableCell className="py-1 px-1.5 hidden md:table-cell">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <span className="text-[0.5rem] text-gray-600 whitespace-nowrap">
                        {subscriber.subscription_start_date
                          ? format(new Date(subscriber.subscription_start_date), "d/M/yy")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[0.5rem] text-gray-600 whitespace-nowrap">
                        {subscriber.subscription_end_date
                          ? format(new Date(subscriber.subscription_end_date), "d/M/yy")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-1 px-1.5 md:hidden">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="xs"
                          className="h-4 w-4 p-0 opacity-80"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-2.5 w-2.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        sideOffset={5}
                        className="w-32"
                      >
                        <DropdownMenuItem 
                          onClick={() => onEdit(subscriber)}
                          className="text-[0.65rem] flex items-center gap-1.5"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                          Edit
                        </DropdownMenuItem>
                        {!subscriber.subscription_status && onAssignPlan && (
                          <DropdownMenuItem 
                            onClick={() => onAssignPlan(subscriber)}
                            className="text-[0.65rem] flex items-center gap-1.5"
                          >
                            <UserPlus className="h-2.5 w-2.5" />
                            Plan
                          </DropdownMenuItem>
                        )}
                        {subscriber.is_blocked && onUnblock && (
                          <DropdownMenuItem 
                            onClick={() => onUnblock(subscriber)}
                            className="text-[0.65rem] flex items-center gap-1.5"
                          >
                            <Unlock className="h-2.5 w-2.5" />
                            Unblock
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onRemove(subscriber)}
                          className="text-[0.65rem] text-red-600 flex items-center gap-1.5"
                        >
                          <XCircle className="h-2.5 w-2.5" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>

                <TableCell className="py-1 px-0.5 hidden md:table-cell">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="xs"
                          className="h-4 w-4 p-0 opacity-60 group-hover:opacity-100 hover:bg-gray-100"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-2 w-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem 
                          onClick={() => onEdit(subscriber)}
                          className="text-[0.65rem] flex items-center gap-1.5"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                          Edit
                        </DropdownMenuItem>
                        {!subscriber.subscription_status && onAssignPlan && (
                          <DropdownMenuItem 
                            onClick={() => onAssignPlan(subscriber)}
                            className="text-[0.65rem] flex items-center gap-1.5"
                          >
                            <UserPlus className="h-2.5 w-2.5" />
                            Plan
                          </DropdownMenuItem>
                        )}
                        {subscriber.is_blocked && onUnblock && (
                          <DropdownMenuItem 
                            onClick={() => onUnblock(subscriber)}
                            className="text-[0.65rem] flex items-center gap-1.5"
                          >
                            <Unlock className="h-2.5 w-2.5" />
                            Unblock
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onRemove(subscriber)}
                          className="text-[0.65rem] text-red-600 flex items-center gap-1.5"
                        >
                          <XCircle className="h-2.5 w-2.5" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
