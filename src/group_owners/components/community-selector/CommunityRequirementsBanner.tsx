import { AnimatePresence } from "framer-motion";
import { useCommunityRequirements } from "@/group_owners/hooks/useCommunityRequirements";
import { LinkEditDialog } from "./LinkEditDialog";
import { SuccessBanner } from "./banners/SuccessBanner";
import { RequirementsBanner } from "./banners/RequirementsBanner";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const CommunityRequirementsBanner = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const entityId = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
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

  if (isLoading || !entityId) return null;

  return (
    <>
      <AnimatePresence mode="sync">
        {isFullyConfigured ? (
          <SuccessBanner
            key="success-banner"
            communityId={entityId}
            customLink={selectedCommunity?.custom_link || null}
            onOpenEditDialog={openEditDialog}
            entityType={isGroupSelected ? 'group' : 'community'}
          />
        ) : (
          <RequirementsBanner
            key="requirements-banner"
            hasPlans={hasPlans}
            hasActivePaymentMethods={hasActivePaymentMethods}
            onNavigateToSubscriptions={navigateToSubscriptions}
            onNavigateToPaymentMethods={navigateToPaymentMethods}
            entityType={isGroupSelected ? 'group' : 'community'}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isEditDialogOpen && (
          <LinkEditDialog 
            key="link-edit-dialog"
            isOpen={isEditDialogOpen}
            onClose={closeEditDialog}
            communityId={entityId}
            currentCustomLink={selectedCommunity?.custom_link || null}
            onLinkUpdated={handleLinkUpdated}
            entityType={isGroupSelected ? 'group' : 'community'}
          />
        )}
      </AnimatePresence>
    </>
  );
};
