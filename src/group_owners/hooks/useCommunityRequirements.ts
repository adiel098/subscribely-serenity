import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroup } from "@/group_owners/hooks/useCommunityGroup";

export const useCommunityRequirements = () => {
  const navigate = useNavigate();
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const entityId = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: communities, refetch: refetchCommunities } = useCommunities();
  const { data: selectedGroup, refetch: refetchGroup } = useCommunityGroup(selectedGroupId || "");

  // Use the payment methods hook for owner's payment methods
  const { data: paymentMethods, isLoading: isLoadingPayments } = usePaymentMethods();
  const { plans, isLoading: isLoadingPlans } = useSubscriptionPlans(entityId || "");

  // Get the selected entity based on whether a community or group is selected
  const selectedEntity = isGroupSelected 
    ? selectedGroup
    : communities?.find(community => community.id === selectedCommunityId);

  // Check if there's any active payment method
  const hasActivePaymentMethods = paymentMethods?.some(pm => pm.is_active) || false;
  const hasPlans = (plans?.length || 0) > 0;
  const isFullyConfigured = hasActivePaymentMethods && hasPlans;
  const isLoading = isLoadingPayments || isLoadingPlans || (isGroupSelected && !selectedGroup);

  const navigateToPaymentMethods = () => {
    navigate("/subscriptions");
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
    if (isGroupSelected) {
      refetchGroup();
    }
  };

  return {
    selectedCommunityId,
    selectedGroupId,
    isGroupSelected,
    selectedCommunity: selectedEntity,
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
