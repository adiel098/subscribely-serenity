import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "./useTelegramUser";
import { useCommunityData } from "./useCommunityData";
import { useUserSubscriptions } from "./useUserSubscriptions";
import { Plan, Community } from "../types/community.types";

export const useAppContent = (initialCommunityId: string, telegramUserId?: string) => {
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  // Default to "discover" tab when no community ID is provided
  const [activeTab, setActiveTab] = useState<string>(initialCommunityId ? "subscribe" : "discover");
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [currentCommunityId, setCurrentCommunityId] = useState<string>(initialCommunityId);
  const { toast } = useToast();
  
  // Telegram user data
  const { 
    user: telegramUser, 
    loading: userLoading, 
    error: userError, 
    refetch: refetchUser 
  } = useTelegramUser(currentCommunityId, telegramUserId);
  
  // Community data
  const { 
    community, 
    loading: communityLoading, 
    error: communityError 
  } = useCommunityData(currentCommunityId);
  
  // User subscriptions data
  const { 
    subscriptions, 
    isLoading: subscriptionsLoading, 
    error: subscriptionsError,
    refetch: refetchSubscriptions,
    renewSubscription 
  } = useUserSubscriptions(telegramUser?.id);
  
  // Set initial community when data loads
  useEffect(() => {
    if (community && !selectedCommunity) {
      console.log('🔍 Community found:', community.name);
      console.log('🌟 Community has plans:', community.subscription_plans?.length || 0);
      setSelectedCommunity(community);
    }
  }, [community, selectedCommunity]);
  
  // Reset selected plan when community changes
  useEffect(() => {
    if (selectedCommunity) {
      setSelectedPlan(null);
      setShowPaymentMethods(false);
    }
  }, [selectedCommunity]);
  
  // Methods
  const handlePlanSelect = (plan: Plan) => {
    console.log('🎯 Selected plan:', plan);
    setSelectedPlan(plan);
    setShowPaymentMethods(true);
    
    // Scroll to payment methods section
    setTimeout(() => {
      const element = document.getElementById('payment-methods');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Only reset these values when NOT specifically handling renewals
    if (value !== "subscribe") {
      setSelectedPlan(null);
      setShowPaymentMethods(false);
      setShowSuccess(false);
    }
  };
  
  const handleCompletePurchase = () => {
    setShowSuccess(true);
    refetchSubscriptions();
  };
  
  const handleRenewSubscription = (subscription: any) => {
    console.log("[useAppContent] Processing renewal for subscription:", subscription);
    renewSubscription(subscription);
  };
  
  const handleSelectCommunity = (community: Community) => {
    console.log("[useAppContent] Selected community:", community);
    
    // Set the selected community
    setSelectedCommunity(community);
    
    // Update the current community ID if needed to fetch details
    if (community.id !== currentCommunityId) {
      setCurrentCommunityId(community.id);
    }
    
    // Switch to subscribe tab
    setActiveTab("subscribe");
    
    // Reset other states
    setSelectedPlan(null);
    setShowPaymentMethods(false);
    setShowSuccess(false);
    
    // Show toast notification
    toast({
      title: "Community selected",
      description: `Viewing ${community.name}`,
    });
  };

  const handleRetry = () => {
    refetchUser();
    setErrorState(null);
  };

  const handleTimeout = () => {
    setErrorState("Loading timeout reached. Please try again.");
  };

  // Calculate which community to display
  const displayCommunity = selectedCommunity || community;

  const lowestPricePlan = useMemo(() => {
    return community?.subscription_plans?.reduce((lowest, plan) => {
      return plan.price < lowest.price ? plan : lowest;
    }, community.subscription_plans[0]);
  }, [community?.subscription_plans]);

  return {
    // States
    isCheckingUserData,
    showEmailForm,
    errorState,
    selectedPlan,
    activeTab,
    showPaymentMethods,
    showSuccess,
    telegramUser,
    displayCommunity,
    community,
    subscriptions,
    subscriptionsLoading,
    // Loading states
    userLoading,
    communityLoading,
    // Errors
    userError,
    communityError,
    // Actions & Handlers
    setIsCheckingUserData,
    setShowEmailForm,
    setErrorState,
    handlePlanSelect,
    handleTabChange,
    handleCompletePurchase,
    handleRenewSubscription,
    handleSelectCommunity,
    handleRetry,
    handleTimeout,
    refetchUser
  };
};
