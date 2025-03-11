
import { AnimatePresence } from "framer-motion";
import { useCommunityRequirements } from "@/group_owners/hooks/useCommunityRequirements";
import { LinkEditDialog } from "./LinkEditDialog";
import { SuccessBanner } from "./banners/SuccessBanner";
import { RequirementsBanner } from "./banners/RequirementsBanner";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const CommunityRequirementsBanner = () => {
  const { selectedCommunityId } = useCommunityContext();
  const {
    selectedCommunity,
    hasActivePaymentMethods,
    hasPlans,
    isFullyConfigured,
    isLoading,
    isEditDialogOpen,
    navigateToPaymentMethods,
    navigateToSubscriptions,
    openEditDialog,
    closeEditDialog,
    handleLinkUpdated
  } = useCommunityRequirements();

  if (isLoading || !selectedCommunityId) return null;

  return (
    <AnimatePresence mode="wait">
      {isFullyConfigured ? (
        <SuccessBanner
          communityId={selectedCommunityId}
          customLink={selectedCommunity?.custom_link || null}
          onOpenEditDialog={openEditDialog}
        />
      ) : (
        <RequirementsBanner
          hasPlans={hasPlans}
          hasActivePaymentMethods={hasActivePaymentMethods}
          onNavigateToSubscriptions={navigateToSubscriptions}
          onNavigateToPaymentMethods={navigateToPaymentMethods}
        />
      )}
      
      <LinkEditDialog 
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        communityId={selectedCommunityId}
        currentCustomLink={selectedCommunity?.custom_link || null}
        onLinkUpdated={handleLinkUpdated}
      />
    </AnimatePresence>
  );
};
