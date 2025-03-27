
import React from "react";
import { Card } from "@/components/ui/card";
import { User, UserPlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { Badge } from "@/components/ui/badge";

interface MobileUnmanagedUsersListProps {
  users: Subscriber[];
  onAssignPlan: (subscriber: Subscriber) => void;
}

export const MobileUnmanagedUsersList: React.FC<MobileUnmanagedUsersListProps> = ({
  users,
  onAssignPlan
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No unmanaged users found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id} className="p-3 shadow-sm subscribers-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-500" />
                <h3 className="font-medium text-sm">
                  {user.telegram_username || 'No username'}
                </h3>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                <span className="block">ID: {user.telegram_user_id}</span>
                {user.first_name && (
                  <span className="block mt-0.5 text-gray-700 font-medium">
                    {user.first_name} {user.last_name || ''}
                  </span>
                )}
              </div>
              
              {user.subscription_plan_id && (
                <div className="flex items-center gap-1 mt-1">
                  <Package className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600">
                    Plan ID: {user.subscription_plan_id}
                  </span>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAssignPlan(user)}
              className="h-7 text-xs px-2 flex items-center gap-1"
            >
              <UserPlus className="h-3 w-3" />
              Assign Plan
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
