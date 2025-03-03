
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Crown } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { SubscriptionsList } from "./SubscriptionsList";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import { EmptySubscriptionsState } from "./EmptySubscriptionsState";

interface UserSubscriptionsProps {
  subscriptions: Subscription[];
  onRefresh: () => void;
  onRenew: (subscription: Subscription) => void;
}

export const UserSubscriptions: React.FC<UserSubscriptionsProps> = ({
  subscriptions,
  onRefresh,
  onRenew,
}) => {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  if (subscriptions.length === 0) {
    return <EmptySubscriptionsState />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-primary" />
        My Subscriptions
      </h2>
      
      <SubscriptionsList 
        subscriptions={subscriptions} 
        onCancelClick={handleCancelClick} 
        onRenew={onRenew} 
      />
      
      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        subscription={selectedSubscription}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onRefresh={onRefresh}
        toast={toast}
      />
    </div>
  );
};
