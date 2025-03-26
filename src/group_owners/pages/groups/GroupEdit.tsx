
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useCommunityGroup } from "@/group_owners/hooks/useCommunityGroup";
import { useUpdateCommunityGroup } from "@/group_owners/hooks/useUpdateCommunityGroup";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroupMembers } from "@/group_owners/hooks/useCommunityGroupMembers";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const GroupEdit = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading } = useCommunityGroup(groupId || "");
  const { data: groupMembers } = useCommunityGroupMembers(groupId || null);
  const { data: communities, isLoading: isLoadingCommunities } = useCommunities();
  const updateGroupMutation = useUpdateCommunityGroup();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setCustomLink(group.custom_link || "");
    }
    
    if (groupMembers) {
      const communityIds = groupMembers.map(member => member.community_id);
      setSelectedCommunityIds(communityIds);
    }
  }, [group, groupMembers]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId) return;
    
    if (selectedCommunityIds.length === 0) {
      toast.error("Please select at least one community");
      return;
    }
    
    updateGroupMutation.mutate({
      id: groupId,
      name,
      description: description || null,
      custom_link: customLink || null,
      communities: selectedCommunityIds
    }, {
      onSuccess: () => {
        toast.success("Group updated successfully!");
        navigate("/dashboard");
      },
      onError: (error) => {
        toast.error(`Failed to update group: ${error.message}`);
      }
    });
  };
  
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only or empty string
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };
  
  const handleCustomLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidCustomLink(value)) {
      setCustomLink(value);
    }
  };
  
  const toggleCommunity = (communityId: string) => {
    setSelectedCommunityIds(prev => {
      if (prev.includes(communityId)) {
        return prev.filter(id => id !== communityId);
      } else {
        return [...prev, communityId];
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Group</h1>
        <div className="w-[76px]"></div> {/* Spacer for alignment */}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !group ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Group not found</p>
          <Button 
            onClick={() => navigate("/dashboard")} 
            variant="outline" 
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Group Details</CardTitle>
              <CardDescription>
                Update information about your community group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this group"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customLink">Custom Link (Optional)</Label>
                <Input 
                  id="customLink" 
                  value={customLink} 
                  onChange={handleCustomLinkChange}
                  placeholder="my-group"
                />
                <p className="text-xs text-muted-foreground">
                  Only letters, numbers, hyphens, and underscores allowed
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Communities in this Group</Label>
                {isLoadingCommunities ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : communities && communities.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                    {communities.map(community => (
                      <div key={community.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`community-${community.id}`} 
                          checked={selectedCommunityIds.includes(community.id)}
                          onCheckedChange={() => toggleCommunity(community.id)}
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
                {communities && communities.length > 0 && selectedCommunityIds.length === 0 && (
                  <p className="text-xs text-amber-600">Please select at least one community</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  updateGroupMutation.isPending || 
                  !name || 
                  selectedCommunityIds.length === 0
                }
              >
                {updateGroupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};

export default GroupEdit;
