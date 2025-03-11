
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useAvailablePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunities } from "@/group_owners/hooks/useCommunities";

export const useCommunityRequirements = () => {
  const navigate = useNavigate();
  const { selectedCommunityId } = useCommunityContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: communities, refetch: refetchCommunities } = useCommunities();

  // שימוש בהוק החדש שמביא גם אמצעי תשלום ברירת מחדל
  const { data: paymentMethods, isLoading: isLoadingPayments } = useAvailablePaymentMethods(selectedCommunityId);
  const { plans, isLoading: isLoadingPlans } = useSubscriptionPlans(selectedCommunityId || "");

  const selectedCommunity = communities?.find(community => community.id === selectedCommunityId);

  // בדיקה אם יש אמצעי תשלום פעיל (כולל ברירות מחדל)
  const hasActivePaymentMethods = paymentMethods?.some(pm => pm.is_active) || false;
  const hasPlans = (plans?.length || 0) > 0;
  const isFullyConfigured = hasActivePaymentMethods && hasPlans;
  const isLoading = isLoadingPayments || isLoadingPlans;

  const navigateToPaymentMethods = () => {
    navigate("/payment-methods");
  };

  const navigateToSubscriptions = () => {
    navigate("/subscriptions");
  };
  
  const navigateToSettings = () => {
    navigate("/bot-settings");
  };

  const openEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleLinkUpdated = () => {
    refetchCommunities();
  };

  return {
    selectedCommunityId,
    selectedCommunity,
    hasActivePaymentMethods,
    hasPlans,
    isFullyConfigured,
    isLoading,
    isEditDialogOpen,
    navigateToPaymentMethods,
    navigateToSubscriptions,
    navigateToSettings,
    openEditDialog,
    closeEditDialog,
    handleLinkUpdated
  };
};
