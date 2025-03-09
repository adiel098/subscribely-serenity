
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunities, Community } from "@/group_owners/hooks/useCommunities";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MiniAppLinkButton } from "./MiniAppLinkButton";

interface CommunitySelectorProps {
  onCommunityChange: (community: Community | null) => void;
}

export const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  onCommunityChange,
}) => {
  const { data: communities, isLoading, refetch } = useCommunities();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (communities && communities.length > 0) {
      setSelectedCommunity(communities[0]);
      onCommunityChange(communities[0]);
    } else {
      onCommunityChange(null);
    }
  }, [communities, onCommunityChange]);

  const handleCommunityChange = (communityId: string) => {
    const community = communities?.find((c) => c.id === communityId) || null;
    setSelectedCommunity(community);
    onCommunityChange(community);
  };

  // Copy mini app link to clipboard
  const handleCopyMiniAppLink = async () => {
    if (!selectedCommunity) return;
    
    const customLink = selectedCommunity.custom_link || selectedCommunity.id;
    const miniAppLink = `https://t.me/SubscribelyBot?start=${customLink}`;
    
    try {
      await navigator.clipboard.writeText(miniAppLink);
      toast({
        title: "Link copied",
        description: "Link has been copied to clipboard"
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleCommunityCreated = async () => {
    setOpen(false);
    await refetch();
  };

  return (
    <div className="space-y-6 border-b border-border pb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold">Community</h2>
          <p className="text-sm text-muted-foreground">
            Select the community you want to manage
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Community</DialogTitle>
              <DialogDescription>
                Create a new community to manage subscriptions and members.
              </DialogDescription>
            </DialogHeader>
            {/* We'll replace the form with a simple message */}
            <div className="py-4">
              <p>Please use the "Create Community" button in the main interface to create a new community.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:items-center justify-between">
          <CommunityDropdown
            communities={communities}
            selectedCommunity={selectedCommunity}
            onCommunityChange={handleCommunityChange}
            isLoading={isLoading}
          />
          
          <div className="mt-2 sm:mt-0 sm:flex-shrink-0">
            <MiniAppLinkButton 
              onClick={handleCopyMiniAppLink} 
              community={selectedCommunity}
            />
          </div>
        </div>

        {selectedCommunity && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="community-name">Community Name</Label>
              <Input
                type="text"
                id="community-name"
                value={selectedCommunity?.name}
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="community-id">Community ID</Label>
              <Input
                type="text"
                id="community-id"
                value={selectedCommunity?.id}
                disabled
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CommunityDropdownProps {
  communities: Community[] | undefined;
  selectedCommunity: Community | null;
  onCommunityChange: (communityId: string) => void;
  isLoading: boolean;
}

const CommunityDropdown: React.FC<CommunityDropdownProps> = ({
  communities,
  selectedCommunity,
  onCommunityChange,
  isLoading,
}) => {
  return (
    <Select onValueChange={onCommunityChange} disabled={isLoading}>
      <SelectTrigger className="w-[320px]">
        <SelectValue placeholder="Select a community" />
      </SelectTrigger>
      <SelectContent>
        {communities?.map((community) => (
          <SelectItem key={community.id} value={community.id}>
            {community.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
