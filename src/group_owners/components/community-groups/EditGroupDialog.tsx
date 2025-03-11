
import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCommunityGroup } from "@/group_owners/hooks/useUpdateCommunityGroup";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroupMembers } from "@/group_owners/hooks/useCommunityGroupMembers";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";

interface EditGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group: CommunityGroup | null;
}

export const EditGroupDialog: React.FC<EditGroupDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  group
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  
  const { data: communities, isLoading: isCommunitiesLoading } = useCommunities();
  const { data: groupMembers, isLoading: isGroupMembersLoading } = useCommunityGroupMembers(group?.id || null);
  const updateGroupMutation = useUpdateCommunityGroup();

  // Load the group data when the dialog opens
  useEffect(() => {
    if (group && isOpen) {
      setName(group.name || "");
      setDescription(group.description || "");
      setCustomLink(group.custom_link || "");
    }
  }, [group, isOpen]);

  // Load the selected communities when the group members data is available
  useEffect(() => {
    if (groupMembers && isOpen) {
      const communityIds = groupMembers.map(member => member.community_id);
      setSelectedCommunities(communityIds);
    }
  }, [groupMembers, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group) return;
    
    updateGroupMutation.mutate({
      id: group.id,
      name,
      description: description || null,
      custom_link: customLink || null,
      communities: selectedCommunities
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const handleCommunityToggle = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  // Validate the custom link format
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only or empty string
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };

  const isLoading = isCommunitiesLoading || isGroupMembersLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Community Group</DialogTitle>
          <DialogDescription>
            Update your community group settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Group Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this group of communities"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="customLink">Custom Link (Optional)</Label>
            <Input 
              id="customLink" 
              value={customLink} 
              onChange={(e) => {
                const value = e.target.value;
                if (isValidCustomLink(value)) {
                  setCustomLink(value);
                }
              }}
              placeholder="my-community-group"
            />
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, hyphens, and underscores allowed
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Select Communities</Label>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : communities && communities.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                {communities.map(community => (
                  <div key={community.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`community-${community.id}`} 
                      checked={selectedCommunities.includes(community.id)}
                      onCheckedChange={() => handleCommunityToggle(community.id)}
                    />
                    <Label 
                      htmlFor={`community-${community.id}`}
                      className="cursor-pointer flex-1 text-sm font-normal"
                    >
                      {community.name}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">No communities available</p>
            )}
            {communities && communities.length > 0 && selectedCommunities.length === 0 && (
              <p className="text-xs text-amber-600">Please select at least one community</p>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                updateGroupMutation.isPending || 
                !name || 
                selectedCommunities.length === 0 || 
                !communities?.length
              }
            >
              {updateGroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
