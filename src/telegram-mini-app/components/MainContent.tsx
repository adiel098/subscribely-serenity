
import React, { useState, useEffect } from "react";
import { ChevronDown, User, UserPlus, Search, LayoutGrid } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Community, Plan } from "@/telegram-mini-app/types/community.types";
import { CommunityHeader } from "@/telegram-mini-app/components/CommunityHeader";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";
import { Card, CardContent } from "@/components/ui/card";
import { TelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSubscriptions } from "@/telegram-mini-app/components/UserSubscriptions";
import { CommunitySearch } from "@/telegram-mini-app/components/CommunitySearch";
import { useUserSubscriptions } from "@/telegram-mini-app/hooks/useUserSubscriptions";
import { Button } from "@/components/ui/button";

interface MainContentProps {
  community: Community;
  telegramUser: TelegramUser | null;
}

export const MainContent: React.FC<MainContentProps> = ({ community, telegramUser }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribe");
  const { subscriptions, isLoading: subscriptionsLoading, refetch: refreshSubscriptions } = 
    useUserSubscriptions(telegramUser?.id);

  // Log user info for debugging
  useEffect(() => {
    if (telegramUser) {
      console.log("👤 Telegram User Info in MainContent:", telegramUser);
    } else {
      console.log("⚠️ No Telegram user data available in MainContent");
    }
    
    // If we're in Telegram, try to use BackButton
    if (window.Telegram?.WebApp?.BackButton) {
      if (selectedPlan && activeTab === "subscribe") {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          setSelectedPlan(null);
          setShowSuccess(false);
          window.Telegram.WebApp.BackButton.hide();
        });
      } else {
        window.Telegram.WebApp.BackButton.hide();
      }
    }
  }, [telegramUser, selectedPlan, activeTab]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    console.log(`Selected payment method: ${method}`);
  };

  const handleCompletePurchase = () => {
    setShowSuccess(true);
    refreshSubscriptions();
    
    // If we're in Telegram, use haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' });
    
    // If we're in Telegram, use haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedPlan(null);
    setShowSuccess(false);
    
    // If we're in Telegram, use haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleRenewSubscription = (subscription: any) => {
    // Find matching plan in current community
    const matchingPlan = community.subscription_plans.find(
      (plan) => plan.id === subscription.plan?.id
    );
    
    if (matchingPlan) {
      setSelectedPlan(matchingPlan);
      setActiveTab("subscribe");
      document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCommunity = (selectedCommunity: any) => {
    // In a real app, this would navigate to the community's page
    // For now, we'll just show a message
    if (window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(`Navigate to community: ${selectedCommunity.name}`);
    } else {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    }
  };

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-8 px-4 space-y-8">
          <CommunityHeader community={community} />

          {telegramUser && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {telegramUser.photo_url ? (
                    <img 
                      src={telegramUser.photo_url} 
                      alt={telegramUser.first_name} 
                      className="h-12 w-12 rounded-full object-cover border-2 border-white/50"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">
                      {telegramUser.first_name} {telegramUser.last_name || ''}
                      {telegramUser.username && <span className="text-sm text-muted-foreground ml-2">@{telegramUser.username}</span>}
                    </h3>
                    {telegramUser.email && (
                      <p className="text-sm text-muted-foreground">{telegramUser.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-primary/5">
              <TabsTrigger value="subscribe" className="flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </TabsTrigger>
              <TabsTrigger value="mySubscriptions" className="flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">My Memberships</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center gap-1.5">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscribe" className="space-y-8 mt-0">
              <div id="subscription-plans" className="scroll-mt-4">
                <SubscriptionPlans
                  plans={community.subscription_plans}
                  selectedPlan={selectedPlan}
                  onPlanSelect={handlePlanSelect}
                />
              </div>

              {selectedPlan && (
                <div id="payment-methods" className="scroll-mt-4">
                  <PaymentMethods
                    selectedPlan={selectedPlan}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onPaymentMethodSelect={handlePaymentMethodSelect}
                    onCompletePurchase={handleCompletePurchase}
                    communityInviteLink={community.telegram_invite_link}
                    showSuccess={showSuccess}
                    telegramUserId={telegramUser?.id}
                  />
                </div>
              )}

              {!selectedPlan && (
                <div className="flex justify-center py-8 animate-bounce">
                  <ChevronDown className="h-6 w-6 text-primary/50" />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mySubscriptions" className="mt-0">
              <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
                <UserSubscriptions 
                  subscriptions={subscriptions} 
                  onRefresh={refreshSubscriptions}
                  onRenew={handleRenewSubscription}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="discover" className="mt-0">
              <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6">
                <CommunitySearch onSelectCommunity={handleSelectCommunity} />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pb-10"></div>
        </div>
      </div>
    </ScrollArea>
  );
};
