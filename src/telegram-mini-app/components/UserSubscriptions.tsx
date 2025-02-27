
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Crown } from "lucide-react";
import { cancelSubscription, Subscription } from "../services/memberService";
import { SubscriptionCard } from "./subscriptions/SubscriptionCard";
import { CancelSubscriptionDialog } from "./subscriptions/CancelSubscriptionDialog";
import { EmptySubscriptions } from "./subscriptions/EmptySubscriptions";

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

  const handleCancelConfirm = async () => {
    if (!selectedSubscription) return;
    
    setIsLoading(true);
    try {
      await cancelSubscription(selectedSubscription.id);
      toast({
        title: "Subscription cancelled",
        description: `You've successfully cancelled your subscription to ${selectedSubscription.community.name}`,
        variant: "default",
      });
      onRefresh();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCancelDialogOpen(false);
    }
  };

  if (subscriptions.length === 0) {
    return <EmptySubscriptions />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-primary" />
        My Subscriptions
      </h2>
      
      <div className="grid gap-4">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onRenew={() => onRenew(subscription)}
            onCancel={handleCancelClick}
          />
        ))}
      </div>
      
      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        subscription={selectedSubscription}
        isLoading={isLoading}
      />
    </div>
  );
};
