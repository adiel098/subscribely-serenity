import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCommunityGroup } from "@/group_owners/hooks/useCreateCommunityGroup";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { data: communities, isLoading: isCommunitiesLoading } = useCommunities();
  const createGroupMutation = useCreateCommunityGroup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError("You must be logged in to create a group");
      toast.error("Authentication required");
      return;
    }
    
    if (selectedCommunities.length === 0) {
      setError("Please select at least one community");
      return;
    }
    
    try {
      await createGroupMutation.mutateAsync({
        name,
        description: description || null,
        custom_link: customLink || null,
        communities: selectedCommunities
      });
      
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error in form submission:", err);
      setError(err.message || "Failed to create group");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCustomLink("");
    setSelectedCommunities([]);
    setError(null);
  };

  const handleCommunityToggle = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const isValidCustomLink = (link: string) => {
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[400px] p-3 gap-3">
        <DialogHeader className="space-y-2 pb-3">
          <DialogTitle className="text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 text-xs">G</span>
            </div>
            Create New Group
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-normal">
            Create a group of communities that can be managed together
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-medium">
              Group Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="h-8 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              className="text-sm resize-none h-16"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="customLink" className="text-xs font-medium">
              Custom Link
            </Label>
            <Input
              id="customLink"
              value={customLink}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidCustomLink(value)) {
                  setCustomLink(value);
                }
              }}
              placeholder="my-group-link"
              className="h-8 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Only letters, numbers, underscores and hyphens
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Select Communities</Label>
            <div className="border rounded-md p-2 space-y-1.5 max-h-35 overflow-y-auto">
              {isCommunitiesLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
              ) : communities?.filter(c => !c.is_group).length > 0 ? (
                communities.filter(c => !c.is_group).map((community) => (
                  <div 
                    key={community.id} 
                    className={`group flex items-center gap-2 p-2 rounded-md transition-all ${
                      selectedCommunities.includes(community.id) ? 'bg-blue-50/50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      id={community.id}
                      checked={selectedCommunities.includes(community.id)}
                      onCheckedChange={() => handleCommunityToggle(community.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer"
                    />
                    <Label
                      htmlFor={community.id}
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    >
                      <Avatar className="h-5 w-5 rounded-full ring-1 ring-border">
                        <AvatarImage 
                          src={community.photo_url || community.telegram_photo_url || `/images/default-community-avatar.png`}
                          alt={community.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-medium">
                          {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium truncate">{community.name}</span>
                        {community.telegram_username && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            @{community.telegram_username}
                          </span>
                        )}
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No communities available
                </p>
              )}
            </div>
            {communities?.filter(c => !c.is_group).length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Selected: {selectedCommunities.length} communities
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="p-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createGroupMutation.isPending}
              className="text-xs h-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white hover:opacity-90"
            >
              {createGroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
