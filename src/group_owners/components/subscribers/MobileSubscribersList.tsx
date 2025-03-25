
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Pencil,
  ExternalLink 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface MobileSubscribersListProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock: (subscriber: Subscriber) => void;
}

export const MobileSubscribersList: React.FC<MobileSubscribersListProps> = ({
  subscribers,
  onEdit,
  onRemove,
  onUnblock
}) => {
  const getStatusBadge = (subscriber: Subscriber) => {
    if (!subscriber.is_active) {
      return (
        <Badge variant="destructive" className="text-[10px] py-0.5 px-1.5 gap-1 font-medium">
          <XCircle className="h-2.5 w-2.5" />
          <span>Removed</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "active") {
      return (
        <Badge variant="success" className="text-[10px] py-0.5 px-1.5 gap-1 font-medium">
          <CheckCircle2 className="h-2.5 w-2.5" />
          <span>Active</span>
        </Badge>
      );
    } else if (subscriber.subscription_status === "removed") {
      return (
        <Badge variant="destructive" className="text-[10px] py-0.5 px-1.5 gap-1 font-medium">
          <XCircle className="h-2.5 w-2.5" />
          <span>Removed</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="warning" className="text-[10px] py-0.5 px-1.5 gap-1 font-medium">
          <XCircle className="h-2.5 w-2.5" />
          <span>Inactive</span>
        </Badge>
      );
    }
  };

  if (subscribers.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-muted-foreground">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Users className="h-7 w-7 text-gray-300" />
        </div>
        <p className="text-base font-medium mb-2 text-gray-700">No subscribers found</p>
        <p className="text-xs text-gray-500 text-center max-w-[250px]">
          No subscribers match your current filters. Try changing your search criteria.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {subscribers.map((subscriber) => (
        <Card key={subscriber.id} className="border border-gray-200 overflow-hidden">
          <div className="p-3">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      {subscriber.telegram_username ? (
                        <a
                          href={`https://t.me/${subscriber.telegram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          @{subscriber.telegram_username}
                          <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-50" />
                        </a>
                      ) : (
                        "No username"
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {subscriber.first_name || ""} {subscriber.last_name || ""}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    {getStatusBadge(subscriber)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-7 w-7 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem 
                          onClick={() => onEdit(subscriber)}
                          className="cursor-pointer text-xs py-1.5"
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5 text-blue-600" />
                          Edit
                        </DropdownMenuItem>
                        
                        {subscriber.subscription_status === "removed" ? (
                          <DropdownMenuItem
                            className="text-blue-600 focus:text-blue-600 cursor-pointer text-xs py-1.5"
                            onClick={() => onUnblock(subscriber)}
                          >
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                            Unblock
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer text-xs py-1.5"
                            onClick={() => onRemove(subscriber)}
                          >
                            <XCircle className="mr-2 h-3.5 w-3.5" />
                            Remove
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-gray-50 p-1.5 rounded">
                    <p className="text-gray-500 mb-1">Plan</p>
                    <p className="font-medium text-gray-800 truncate">
                      {subscriber.plan ? subscriber.plan.name : 'No plan'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-1.5 rounded">
                    <p className="text-gray-500 mb-1">Joined</p>
                    <p className="font-medium text-gray-800">
                      {format(new Date(subscriber.joined_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-1.5 rounded">
                    <p className="text-gray-500 mb-1">Start</p>
                    <p className="font-medium text-gray-800">
                      {subscriber.subscription_start_date
                        ? format(new Date(subscriber.subscription_start_date), "MMM d, yyyy")
                        : "-"}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-1.5 rounded">
                    <p className="text-gray-500 mb-1">End</p>
                    <p className="font-medium text-gray-800">
                      {subscriber.subscription_end_date
                        ? format(new Date(subscriber.subscription_end_date), "MMM d, yyyy")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
