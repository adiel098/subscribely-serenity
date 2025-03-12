
import React, { useState, useEffect } from "react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GroupMembersEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityGroup;
  currentCommunities: Community[];
  onCommunitiesUpdated: () => void;
}

export const GroupMembersEditSheet = ({ 
  isOpen, 
  onClose, 
  group, 
  currentCommunities,
  onCommunitiesUpdated
}: GroupMembersEditSheetProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  
  // Get all available communities
  const { data: allCommunities, isLoading: isLoadingCommunities } = useCommunities();
  
  // Filter out communities that are already in the group and match search query
  const availableCommunities = allCommunities?.filter(community => 
    !currentCommunities.some(c => c.id === community.id) && 
    !community.is_group &&
    (searchQuery.trim() === "" || 
     community.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Initialize selected communities when component mounts
  useEffect(() => {
    if (currentCommunities.length > 0) {
      setSelectedCommunities(currentCommunities.map(c => c.id));
    }
  }, [currentCommunities]);

  // Handle adding/removing communities to/from the group
  const handleSaveCommunities = async () => {
    try {
      setIsSubmitting(true);
      
      // Find communities to remove (in current but not in selected)
      const communitiesToRemove = currentCommunities
        .filter(c => !selectedCommunities.includes(c.id))
        .map(c => c.id);
      
      // Find communities to add (in selected but not in current)
      const communitiesToAdd = selectedCommunities
        .filter(id => !currentCommunities.some(c => c.id === id));
      
      // Remove communities if needed
      if (communitiesToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("community_group_members")
          .delete()
          .eq("parent_id", group.id)
          .in("community_id", communitiesToRemove);
          
        if (removeError) {
          console.error("Error removing communities:", removeError);
          toast.error("Failed to remove some communities");
        }
      }
      
      // Add communities if needed
      if (communitiesToAdd.length > 0) {
        try {
          // Use the add-communities-to-group edge function
          const { error } = await supabase.functions.invoke("add-communities-to-group", {
            body: {
              groupId: group.id,
              communityIds: communitiesToAdd,
              userId: (await supabase.auth.getUser()).data.user?.id
            }
          });
          
          if (error) {
            console.error("Error adding communities:", error);
            toast.error("Failed to add some communities");
          }
        } catch (error) {
          console.error("Error invoking add-communities function:", error);
          toast.error("Failed to add communities");
        }
      }
      
      toast.success("Group communities updated successfully");
      onCommunitiesUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating group communities:", error);
      toast.error("An error occurred while updating communities");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle a community selection
  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

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
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Communities</h3>
            
            {currentCommunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No communities in this group yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                {currentCommunities.map(community => (
                  <div 
                    key={community.id} 
                    className="flex items-center space-x-2 border p-2 rounded-md"
                  >
                    <Checkbox 
                      id={`current-${community.id}`}
                      checked={selectedCommunities.includes(community.id)}
                      onCheckedChange={() => toggleCommunity(community.id)}
                    />
                    <label 
                      htmlFor={`current-${community.id}`}
                      className="text-sm font-medium flex-grow cursor-pointer"
                    >
                      {community.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Search for communities to add */}
          <div className="space-y-2 pt-2 border-t">
            <h3 className="text-sm font-medium">Add Communities</h3>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoadingCommunities ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : availableCommunities.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">
                {searchQuery ? "No matching communities found" : "No more communities available"}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {availableCommunities.map(community => (
                  <div 
                    key={community.id} 
                    className="flex items-center space-x-2 border p-2 rounded-md"
                  >
                    <Checkbox 
                      id={`add-${community.id}`}
                      checked={selectedCommunities.includes(community.id)}
                      onCheckedChange={() => toggleCommunity(community.id)}
                    />
                    <label 
                      htmlFor={`add-${community.id}`}
                      className="text-sm font-medium flex-grow cursor-pointer"
                    >
                      {community.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
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
