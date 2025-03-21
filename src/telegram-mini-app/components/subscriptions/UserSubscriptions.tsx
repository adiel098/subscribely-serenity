
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Shield, Clock } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { SubscriptionsList } from "./SubscriptionsList";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import { EmptySubscriptionsState } from "./EmptySubscriptionsState";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

interface UserSubscriptionsProps {
  subscriptions: Subscription[];
  onRefresh: () => void;
  onRenew: (subscription: Subscription) => void;
  onDiscoverClick?: () => void;
}

export const UserSubscriptions: React.FC<UserSubscriptionsProps> = ({
  subscriptions,
  onRefresh,
  onRenew,
  onDiscoverClick
}) => {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const handleRenewClick = (subscription: Subscription) => {
    console.log("[UserSubscriptions] Renewing subscription:", subscription.id);
    onRenew(subscription);
  };

  // Show stats if we have subscriptions
  const activeCount = subscriptions.filter(sub => 
    sub.subscription_status === 'active' || sub.subscription_status === 'trial'
  ).length;
  
  const expiringCount = subscriptions.filter(sub => {
    const expiryDate = new Date(sub.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return sub.subscription_status === 'active' && daysUntilExpiry <= 7;
  }).length;

  if (subscriptions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-120px)]">
        <SectionHeader
          icon={<Crown className="h-5 w-5" />}
          title="My Subscriptions"
          description="Manage your active memberships"
          gradient="purple"
        />
        <EmptySubscriptionsState onDiscoverClick={onDiscoverClick} />
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-[calc(100vh-120px)]">
      <SectionHeader
        icon={<Crown className="h-5 w-5" />}
        title="My Subscriptions"
        description="Manage your active memberships"
        gradient="purple"
      />
      
      {subscriptions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div className="bg-white rounded-xl p-3 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 border shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Expiring Soon</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{expiringCount}</p>
          </div>
        </motion.div>
      )}
      
      <SubscriptionsList 
        subscriptions={subscriptions} 
        onCancelClick={handleCancelClick} 
        onRenew={handleRenewClick} 
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
