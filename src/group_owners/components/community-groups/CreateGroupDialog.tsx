
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

  // Validate the custom link format
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only or empty string
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Community Group</DialogTitle>
          <DialogDescription>
            Create a group of communities that can be managed together.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
            {isCommunitiesLoading ? (
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
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                createGroupMutation.isPending || 
                !name || 
                selectedCommunities.length === 0 || 
                !communities?.length
              }
            >
              {createGroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
