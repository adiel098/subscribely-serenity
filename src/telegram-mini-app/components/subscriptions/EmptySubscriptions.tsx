
import React from "react";
import { Crown } from "lucide-react";

export const EmptySubscriptions: React.FC = () => {
  return (
    <div className="text-center py-10 space-y-3">
      <Crown className="h-16 w-16 mx-auto text-primary opacity-50" />
      <h3 className="text-xl font-medium">No subscriptions yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        You don't have any active subscriptions. Browse communities to find groups to join.
      </p>
    </div>
  );
};
