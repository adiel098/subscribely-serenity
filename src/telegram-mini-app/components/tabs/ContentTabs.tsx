
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionPlanSection } from "./SubscriptionPlanSection";
import { PaymentHistoryTab } from "../payment-history/PaymentHistoryTab";
import { UserSubscriptions } from "../subscriptions";
import { CreditCard, Sparkles, User } from "lucide-react";

interface ContentTabsProps {
  communityId?: string;
  telegramUserId?: string;
  telegramUsername?: string;
}

export const ContentTabs: React.FC<ContentTabsProps> = ({
  communityId,
  telegramUserId,
  telegramUsername,
}) => {
  return (
    <Tabs defaultValue="subscription" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="subscription" className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Plans</span>
        </TabsTrigger>
        <TabsTrigger value="memberships" className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          <span>My Memberships</span>
        </TabsTrigger>
        <TabsTrigger value="payment-history" className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          <span>Payments</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="subscription">
        <SubscriptionPlanSection
          communityId={communityId}
          telegramUserId={telegramUserId}
          telegramUsername={telegramUsername}
        />
      </TabsContent>

      <TabsContent value="memberships">
        <UserSubscriptions telegramUserId={telegramUserId} />
      </TabsContent>

      <TabsContent value="payment-history">
        <PaymentHistoryTab telegramUserId={telegramUserId} />
      </TabsContent>
    </Tabs>
  );
};
