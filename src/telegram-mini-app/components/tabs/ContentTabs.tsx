
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, LayoutGrid, Search, Receipt } from "lucide-react";
import { Plan, Community } from "@/telegram-mini-app/types/community.types";
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
  onSelectCommunity: (community: Community) => void;
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
  
  // Handler for when a community is selected from search
  const handleCommunitySelect = (community: Community) => {
    // Call the parent's onSelectCommunity function
    onSelectCommunity(community);
    
    // Automatically switch to the subscribe tab
    handleTabChange("subscribe");
  };
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-transparent border border-indigo-200 rounded-xl shadow-sm backdrop-blur-sm">
        <TabsTrigger 
          value="subscribe" 
          className="flex items-center gap-1.5 font-medium text-indigo-700 data-[state=active]:bg-indigo-50/80 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribe</span>
        </TabsTrigger>
        <TabsTrigger 
          value="mySubscriptions" 
          className="flex items-center gap-1.5 font-medium text-indigo-700 data-[state=active]:bg-indigo-50/80 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">My Memberships</span>
        </TabsTrigger>
        <TabsTrigger 
          value="paymentHistory" 
          className="flex items-center gap-1.5 font-medium text-indigo-700 data-[state=active]:bg-indigo-50/80 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg"
        >
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Payments</span>
        </TabsTrigger>
        <TabsTrigger 
          value="discover" 
          className="flex items-center gap-1.5 font-medium text-indigo-700 data-[state=active]:bg-indigo-50/80 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg"
        >
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
          <CommunitySearch onSelectCommunity={handleCommunitySelect} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
