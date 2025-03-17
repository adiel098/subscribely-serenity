
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Edit, PenLine, Plus, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupPropertyEditSection } from "./GroupPropertyEditSection";
import { useUpdateCommunityGroup } from "@/group_owners/hooks/useUpdateCommunityGroup";
import { toast } from "sonner";

interface GroupDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityGroup;
  communities: Community[];
  fullLink: string;
  onCopyLink: () => void;
  onEditLink: () => void;
  onEditCommunities: () => void;
  isEditModeByDefault?: boolean;
}

export const GroupDetailsDialog = ({
  isOpen,
  onClose,
  group,
  communities,
  fullLink,
  onCopyLink,
  onEditLink,
  onEditCommunities,
  isEditModeByDefault = true, // Changed to default to true
}: GroupDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(isEditModeByDefault);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [photoUrl, setPhotoUrl] = useState(group.telegram_photo_url || "");
  
  const updateGroupMutation = useUpdateCommunityGroup();
  
  // Reset form state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setIsEditing(isEditModeByDefault);
      setName(group.name);
      setDescription(group.description || "");
      setPhotoUrl(group.telegram_photo_url || "");
    }
  }, [isOpen, group, isEditModeByDefault]);
  
  const handleSaveChanges = () => {
    updateGroupMutation.mutate(
      {
        id: group.id,
        name,
        description: description || null,
        photo_url: photoUrl || null
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Group details updated successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to update group: ${error.message}`);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {isEditing ? (
              <span className="text-purple-600">Edit Group Details</span>
            ) : (
              <>
                {group.name}
                <Badge variant="outline" className="bg-purple-50 text-purple-700 ml-2">
                  Group
                </Badge>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {isEditing ? (
            // Edit Mode
            <GroupPropertyEditSection 
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
            />
          ) : (
            // View Mode
            <>
              {/* Group Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {group.description || "No description provided"}
                </p>
              </div>
            </>
          )}

          {/* Group Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Group Link</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={onEditLink}
                // Removed the disabled={isEditing} prop to make button always available
              >
                <PenLine className="h-3 w-3" />
                Edit
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 p-2 rounded-md text-sm font-mono text-gray-700 overflow-x-auto">
                {fullLink}
              </div>
              <Button 
                size="sm" 
                className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" 
                onClick={onCopyLink}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>

          {/* Communities in group */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Communities in Group</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={onEditCommunities}
                // Removed the disabled={isEditing} prop to make button always available
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </div>
            
            {communities && communities.length > 0 ? (
              <ScrollArea className="max-h-44 pr-4">
                <div className="space-y-2">
                  {communities.map((community) => (
                    <div key={community.id} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-100">
                      <div className="text-sm font-medium">{community.name}</div>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        {community.is_group ? "Group" : "Community"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">No communities added to this group</p>
                <Button 
                  variant="link" 
                  className="mt-1 text-indigo-600 text-xs gap-1" 
                  onClick={onEditCommunities}
                  // Removed the disabled={isEditing} prop to make button always available
                >
                  <Plus className="h-3 w-3" />
                  Add communities
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateGroupMutation.isPending || !name.trim()}
              >
                {updateGroupMutation.isPending ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Group
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
