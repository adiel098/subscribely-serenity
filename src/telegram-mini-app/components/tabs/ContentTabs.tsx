
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, LayoutGrid, Search, Receipt } from "lucide-react";
import { Plan, Community } from "@/telegram-mini-app/types/community.types";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { SubscriptionPlanSection } from "./SubscriptionPlanSection";
import { CommunitySearch } from "@/telegram-mini-app/components/CommunitySearch";
import { UserSubscriptions } from "@/telegram-mini-app/components/subscriptions";
import { PaymentHistoryTab } from "@/telegram-mini-app/components/payment-history/PaymentHistoryTab";
import { motion } from "framer-motion";

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
  community?: Community | null;
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
  telegramUserId,
  community
}) => {
  
  // Handler for when a community is selected from search
  const handleCommunitySelect = (community: Community) => {
    // Call the parent's onSelectCommunity function
    onSelectCommunity(community);
  };
  
  // Show different tabs based on whether we have a community or not
  const showSubscribeTab = !!community;
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="relative w-full flex justify-center mb-8">
        {/* Floating tab bar with shadows, backdrop blur and gradient border */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 left-0 right-0 z-50 mx-auto flex justify-center px-2 md:px-0"
        >
          <TabsList 
            className={`
              glassmorphism shadow-xl border border-white/40 
              backdrop-blur-xl bg-white/70 dark:bg-black/40
              ${showSubscribeTab ? 'w-[320px]' : 'w-[240px]'}
              overflow-hidden rounded-full p-1 h-14
              flex items-center justify-between
              bg-gradient-to-br from-white/80 to-white/40
              dark:from-gray-900/90 dark:to-gray-900/70
              shadow-[0_8px_32px_0_rgba(0,0,0,0.10)]
            `}
          >
            {showSubscribeTab && (
              <TabsTrigger 
                value="subscribe" 
                className="h-10 rounded-full data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center w-full h-full px-3">
                  <UserPlus className="h-4 w-4" />
                  <span className="ml-1.5 text-xs font-medium">Join</span>
                </div>
              </TabsTrigger>
            )}
            
            <TabsTrigger 
              value="mySubscriptions" 
              className="h-10 rounded-full data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-full h-full px-3">
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-1.5 text-xs font-medium">My&nbsp;Subs</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="paymentHistory" 
              className="h-10 rounded-full data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-full h-full px-3">
                <Receipt className="h-4 w-4" />
                <span className="ml-1.5 text-xs font-medium">Payments</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="discover" 
              className="h-10 rounded-full data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-full h-full px-3">
                <Search className="h-4 w-4" />
                <span className="ml-1.5 text-xs font-medium">Discover</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </motion.div>
      </div>
      
      {showSubscribeTab && (
        <TabsContent value="subscribe" className="mt-0">
          <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6 mb-16">
            <SubscriptionPlanSection
              plans={communitySubscriptionPlans}
              selectedPlan={selectedPlan}
              onPlanSelect={onPlanSelect}
              showPaymentMethods={showPaymentMethods}
              userSubscriptions={subscriptions}
              communityId={community?.id}
              communityName={community?.name}
            />
          </div>
        </TabsContent>
      )}
      
      <TabsContent value="mySubscriptions" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6 mb-16">
          <UserSubscriptions 
            subscriptions={subscriptions} 
            onRefresh={onRefreshSubscriptions}
            onRenew={onRenewSubscription}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="paymentHistory" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6 mb-16">
          <PaymentHistoryTab telegramUserId={telegramUserId} />
        </div>
      </TabsContent>
      
      <TabsContent value="discover" className="mt-0">
        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6 mb-16">
          <CommunitySearch onSelectCommunity={handleCommunitySelect} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
