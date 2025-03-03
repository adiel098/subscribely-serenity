
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, LayoutGrid, Search, Receipt } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { SubscriptionPlanSection } from "./SubscriptionPlanSection";
import { CommunitySearch } from "@/telegram-mini-app/components/CommunitySearch";
import { UserSubscriptions } from "@/telegram-mini-app/components/subscriptions";
import { PaymentHistoryTab } from "@/telegram-mini-app/components/payment-history/PaymentHistoryTab";

interface ContentTabsProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  communitySubscriptionPlans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  showPaymentMethods: boolean;
  subscriptions: Subscription[];
  onRefreshSubscriptions: () => void;
  onRenewSubscription: (subscription: Subscription) => void;
  onSelectCommunity: (community: any) => void;
  telegramUserId?: string;
}

export const ContentTabs: React.FC<ContentTabsProps> = ({
  activeTab,
  handleTabChange,
  communitySubscriptionPlans,
  selectedPlan,
  onPlanSelect,
  showPaymentMethods,
  subscriptions,
  onRefreshSubscriptions,
  onRenewSubscription,
  onSelectCommunity,
  telegramUserId
}) => {
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-primary/5">
        <TabsTrigger value="subscribe" className="flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribe</span>
        </TabsTrigger>
        <TabsTrigger value="mySubscriptions" className="flex items-center gap-1.5">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">My Memberships</span>
        </TabsTrigger>
        <TabsTrigger value="paymentHistory" className="flex items-center gap-1.5">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Payments</span>
        </TabsTrigger>
        <TabsTrigger value="discover" className="flex items-center gap-1.5">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Discover</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="subscribe" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
          <SubscriptionPlanSection
            plans={communitySubscriptionPlans}
            selectedPlan={selectedPlan}
            onPlanSelect={onPlanSelect}
            showPaymentMethods={showPaymentMethods}
            userSubscriptions={subscriptions}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="mySubscriptions" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
          <UserSubscriptions 
            subscriptions={subscriptions} 
            onRefresh={onRefreshSubscriptions}
            onRenew={onRenewSubscription}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="paymentHistory" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
          <PaymentHistoryTab telegramUserId={telegramUserId} />
        </div>
      </TabsContent>
      
      <TabsContent value="discover" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
          <CommunitySearch onSelectCommunity={onSelectCommunity} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
