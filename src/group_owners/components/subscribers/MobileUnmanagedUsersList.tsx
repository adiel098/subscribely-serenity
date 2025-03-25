
import React from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, ExternalLink } from "lucide-react";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface MobileUnmanagedUsersListProps {
  users: Subscriber[];
  onAssignPlan: (user: Subscriber) => void;
}

export const MobileUnmanagedUsersList: React.FC<MobileUnmanagedUsersListProps> = ({
  users,
  onAssignPlan
}) => {
  if (users.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-muted-foreground">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <UserPlus className="h-7 w-7 text-gray-300" />
        </div>
        <p className="text-base font-medium mb-2 text-gray-700">No unmanaged users found</p>
        <p className="text-xs text-gray-500 text-center max-w-[250px]">
          All Telegram users in your channel currently have subscription plans assigned.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id} className="border border-gray-200 overflow-hidden">
          <div className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-800">
                  {user.telegram_username ? (
                    <a
                      href={`https://t.me/${user.telegram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      @{user.telegram_username}
                      <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-50" />
                    </a>
                  ) : (
                    "No username"
                  )}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {user.first_name || ""} {user.last_name || ""}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div className="bg-gray-50 p-1.5 rounded">
                    <p className="text-gray-500 mb-1">ID</p>
                    <p className="font-mono text-gray-800 truncate">{user.telegram_user_id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-1.5 rounded">
                    <p className="text-gray-500 mb-1">Joined</p>
                    <p className="font-medium text-gray-800">
                      {format(new Date(user.joined_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 text-xs h-7 px-2"
                onClick={() => onAssignPlan(user)}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Assign
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
