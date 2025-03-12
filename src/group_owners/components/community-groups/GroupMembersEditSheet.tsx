
import React, { useEffect } from "react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CurrentCommunitiesSection } from "./group-members-edit/CurrentCommunitiesSection";
import { AddCommunitiesSection } from "./group-members-edit/AddCommunitiesSection";
import { useGroupMembersEdit } from "./group-members-edit/useGroupMembersEdit";
import { useAvailableCommunities } from "./group-members-edit/useAvailableCommunities";
import { GroupMembersEditSheetProps } from "./group-members-edit/types";

export const GroupMembersEditSheet = ({ 
  isOpen, 
  onClose, 
  group, 
  currentCommunities,
  onCommunitiesUpdated
}: GroupMembersEditSheetProps) => {
  const {
    isSubmitting,
    searchQuery,
    setSearchQuery,
    selectedCommunities,
    toggleCommunity,
    handleSaveCommunities
  } = useGroupMembersEdit(group, currentCommunities, onCommunitiesUpdated, onClose);
  
  const { availableCommunities, isLoadingCommunities } = useAvailableCommunities(
    searchQuery, 
    currentCommunities
  );

  // Reset search query when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, setSearchQuery]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Group Communities</SheetTitle>
          <SheetDescription>
            Add or remove communities from this group.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 space-y-4">
          {/* Current communities section */}
          <CurrentCommunitiesSection 
            communities={currentCommunities}
            selectedCommunities={selectedCommunities}
            toggleCommunity={toggleCommunity}
          />
          
          {/* Search for communities to add */}
          <AddCommunitiesSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            availableCommunities={availableCommunities}
            isLoadingCommunities={isLoadingCommunities}
            selectedCommunities={selectedCommunities}
            toggleCommunity={toggleCommunity}
          />
        </div>
        
        <SheetFooter className="pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCommunities} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
