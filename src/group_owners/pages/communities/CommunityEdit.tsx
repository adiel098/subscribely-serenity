
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useCommunity } from "@/group_owners/hooks/useCommunity";
import { useUpdateCommunity } from "@/group_owners/hooks/useUpdateCommunity";
import { toast } from "sonner";

const CommunityEdit = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { data: community, isLoading } = useCommunity(communityId);
  const updateCommunityMutation = useUpdateCommunity();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customLink, setCustomLink] = useState("");
  
  useEffect(() => {
    if (community) {
      setName(community.name || "");
      setDescription(community.description || "");
      setCustomLink(community.custom_link || "");
    }
  }, [community]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!communityId) return;
    
    updateCommunityMutation.mutate({
      id: communityId,
      name,
      description: description || null,
      custom_link: customLink || null
    }, {
      onSuccess: () => {
        toast.success("Community updated successfully!");
        navigate("/dashboard");
      },
      onError: (error) => {
        toast.error(`Failed to update community: ${error.message}`);
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
        <h1 className="text-2xl font-bold">Edit Community</h1>
        <div className="w-[76px]"></div> {/* Spacer for alignment */}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !community ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Community not found</p>
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
              <CardTitle>Community Details</CardTitle>
              <CardDescription>
                Update information about your community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter community name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your community"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customLink">Custom Link (Optional)</Label>
                <Input 
                  id="customLink" 
                  value={customLink} 
                  onChange={handleCustomLinkChange}
                  placeholder="my-community"
                />
                <p className="text-xs text-muted-foreground">
                  Only letters, numbers, hyphens, and underscores allowed
                </p>
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
                disabled={updateCommunityMutation.isPending || !name}
              >
                {updateCommunityMutation.isPending ? (
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

export default CommunityEdit;
