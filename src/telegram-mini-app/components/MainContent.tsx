
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

  console.log("🔍 Community in MainContent:", community);
  console.log("🔍 Community.subscription_plans:", community?.subscription_plans);
  console.log("🔍 TelegramUser in MainContent:", telegramUser);

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
    if (window.Telegram?.WebApp) {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    } else {
      alert(`This would navigate to: ${selectedCommunity.name}`);
    }
  };

  // Ensure we have data before rendering
  if (!community || !community.subscription_plans) {
    console.error("❌ Missing community or subscription plans data");
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading community data...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100vh] w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5">
        <div className="container max-w-2xl mx-auto pt-4 px-4 space-y-6">
          {/* Debug information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded mb-4 text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>User ID: {telegramUser?.id || 'Not available'}</p>
              <p>Plans Count: {community.subscription_plans?.length || 0}</p>
              <p>Active Tab: {activeTab}</p>
            </div>
          )}
          
          {/* Telegram User Info - Moved to top and redesigned */}
          {telegramUser && (
            <Card className="bg-gradient-to-r from-[#9b87f5]/20 to-[#D946EF]/10 border-[#8B5CF6]/30 overflow-hidden relative">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {telegramUser.photo_url ? (
                      <Avatar className="h-10 w-10 border-2 border-[#9b87f5]/50">
                        <AvatarImage 
                          src={telegramUser.photo_url} 
                          alt={telegramUser.first_name} 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[#8B5CF6]/20 text-[#8B5CF6]">
                          {telegramUser.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-10 w-10 bg-[#8B5CF6]/20 border-2 border-[#9b87f5]/50">
                        <AvatarFallback>
                          <User className="h-5 w-5 text-[#8B5CF6]" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Community logo overlay */}
                    {community.telegram_photo_url && (
                      <div className="absolute -bottom-1 -right-1 border-2 border-white rounded-full overflow-hidden h-6 w-6">
                        <img 
                          src={community.telegram_photo_url} 
                          alt={community.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[#1A1F2C]">
                      {telegramUser.first_name} {telegramUser.last_name || ''}
                      {telegramUser.username && (
                        <span className="text-xs text-[#6E59A5] ml-1">@{telegramUser.username}</span>
                      )}
                    </h3>
                    {telegramUser.email && (
                      <p className="text-xs text-[#7E69AB]">{telegramUser.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <CommunityHeader community={community} />

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
                {community.subscription_plans && community.subscription_plans.length > 0 ? (
                  <SubscriptionPlans
                    plans={community.subscription_plans}
                    selectedPlan={selectedPlan}
                    onPlanSelect={handlePlanSelect}
                  />
                ) : (
                  <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No subscription plans available for this community.</p>
                  </div>
                )}
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

              {!selectedPlan && community.subscription_plans && community.subscription_plans.length > 0 && (
                <div className="flex justify-center py-6 animate-bounce">
                  <ChevronDown className="h-5 w-5 text-primary/50" />
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
