import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommunities, Community } from "@/group_owners/hooks/useCommunities";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Copy, Sparkles, Users, Radio } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MiniAppLinkButton } from "./MiniAppLinkButton";
import { CommunityAvatar } from "./photo-handling/CommunityAvatar";

interface CommunitySelectorProps {
  onCommunityChange: (community: Community | null) => void;
}

export const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  onCommunityChange,
}) => {
  const { data: communities, isLoading, refetch } = useCommunities();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<"channel" | "group">("channel");
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Handle refreshing community photo
  const handleRefreshPhoto = (e: React.MouseEvent, communityId: string, chatId?: string | null) => {
    e.stopPropagation();
    setIsRefreshing(true);
    // Add photo refresh logic here if needed
    
    toast({
      title: "Refreshing photo",
      description: "Community photo is being refreshed"
    });
    
    // Simulate refresh with timeout
    setTimeout(() => {
      setIsRefreshing(false);
      refetch();
    }, 1000);
  };

  return (
    <div className="space-y-2 sm:space-y-6 border-b border-border pb-2 sm:pb-6">
      <div className="flex items-center justify-between">
        <div className="hidden sm:block space-y-0.5">
          <h2 className="text-lg font-semibold">Community</h2>
          <p className="text-sm text-muted-foreground">
            Select the community you want to manage
          </p>
        </div>
        <div className="hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden">
                <PlusCircle className="mr-0.5 h-2.5 w-2.5" />
                <span>New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => {
                setOpen(true);
                setInitialType("channel");
              }}>
                <Radio className="mr-2 h-3 w-3" />
                <span className="text-xs">Channel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setOpen(true);
                setInitialType("group");
              }}>
                <Users className="mr-2 h-3 w-3" />
                <span className="text-xs">Group</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden sm:block">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <PlusCircle className="mr-1 h-3 w-3" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-4">
              <DialogHeader className="space-y-2 pb-4">
                <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Create New {initialType === "channel" ? "Channel" : "Group"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-normal">
                  Create a new community to manage subscriptions and members. You can create either a channel or a group.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Community Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Enter community name" 
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Input 
                    id="description" 
                    placeholder="Enter community description" 
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="type" className="text-xs font-medium">
                    Community Type
                  </Label>
                  <Select value={initialType} onValueChange={(value: "channel" | "group") => setInitialType(value)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="channel" className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs">@</span>
                          </div>
                          Channel
                        </div>
                      </SelectItem>
                      <SelectItem value="group" className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 text-xs">G</span>
                          </div>
                          Group
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  className="text-xs h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white hover:opacity-90"
                >
                  Create Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-6">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:items-center justify-between">
          <div className="w-full">
            <Select
              value={selectedCommunity?.id}
              onValueChange={handleCommunityChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-white/50 border-gray-200 hover:bg-white/80 transition-colors h-8 sm:h-10 text-xs sm:text-sm">
                <div className="flex items-center gap-2 w-full">
                  {selectedCommunity && (
                    <CommunityAvatar
                      community={selectedCommunity}
                      photoUrl={selectedCommunity.telegram_photo_url || undefined}
                      isRefreshing={isRefreshing}
                      onRefresh={(e) => handleRefreshPhoto(e, selectedCommunity.id)}
                      size="sm"
                      showRefreshButton={true}
                    />
                  )}
                  <SelectValue placeholder="Select a community" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {/* Channels Section */}
                {communities?.some(c => !c.is_group) && (
                  <>
                    <div className="px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground">
                      Your Channels
                    </div>
                    {communities.filter(c => !c.is_group).map((community) => (
                      <SelectItem 
                        key={community.id} 
                        value={community.id}
                        className="flex items-center gap-2"
                      >
                        <CommunityAvatar
                          community={community}
                          photoUrl={community.telegram_photo_url || undefined}
                          isRefreshing={false}
                          onRefresh={(e) => handleRefreshPhoto(e, community.id)}
                          size="sm"
                          showRefreshButton={true}
                        />
                        {community.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {/* Groups Section */}
                {communities?.some(c => c.is_group) && (
                  <>
                    <div className="px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-muted-foreground mt-2">
                      Your Groups
                    </div>
                    {communities.filter(c => c.is_group).map((community) => (
                      <SelectItem 
                        key={community.id} 
                        value={community.id}
                        className="flex items-center gap-2"
                      >
                        <CommunityAvatar
                          community={community}
                          photoUrl={community.telegram_photo_url || undefined}
                          isRefreshing={false}
                          onRefresh={(e) => handleRefreshPhoto(e, community.id)}
                          size="sm"
                          showRefreshButton={true}
                        />
                        {community.name}
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* Empty State */}
                {(!communities || communities.length === 0) && (
                  <div className="px-2 py-4 text-xs sm:text-sm text-center text-muted-foreground">
                    No communities found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          
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
