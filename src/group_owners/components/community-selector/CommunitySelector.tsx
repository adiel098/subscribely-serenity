import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { PlusCircle, Copy, Sparkles, Users, Radio, Loader2, Settings2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (communities && communities.length > 0) {
      const community = communities[0];
      setSelectedCommunity(community);
      onCommunityChange(community);
    } else {
      onCommunityChange(null);
    }
  }, [communities, onCommunityChange]);

  const handleCommunityChange = (communityId: string) => {
    const community = communities?.find((c) => c.id === communityId) || null;
    setSelectedCommunity(community);
    onCommunityChange(community);

    if (location.pathname.includes('/groups/edit/')) {
      navigate(`/groups/edit/${communityId}`);
    }
  };

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

  const handleRefreshPhoto = (e: React.MouseEvent, communityId: string, chatId?: string | null) => {
    e.stopPropagation();
    setIsRefreshing(true);
    // Add photo refresh logic here if needed
    
    toast({
      title: "Refreshing photo",
      description: "Community photo is being refreshed"
    });
    
    setTimeout(() => {
      setIsRefreshing(false);
      refetch();
    }, 1000);
  };

  const handleEditGroup = () => {
    if (selectedCommunity?.id && selectedCommunity?.is_group) {
      navigate(`/groups/edit/${selectedCommunity.id}`);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2 flex-1">
        <Select
          value={selectedCommunity?.id}
          onValueChange={handleCommunityChange}
        >
          <SelectTrigger
            className={cn(
              "w-[200px] border-none focus:ring-0 focus:ring-offset-0",
              "bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors",
              "text-sm font-medium"
            )}
          >
            <SelectValue>
              <div className="flex items-center gap-2">
                {selectedCommunity ? (
                  <>
                    <CommunityAvatar community={selectedCommunity} className="h-6 w-6" />
                    <span className="truncate">{selectedCommunity.name}</span>
                    {selectedCommunity.is_group && (
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md">
                        Group
                      </span>
                    )}
                  </>
                ) : (
                  <span>Select a community</span>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {communities?.map((community) => (
              <SelectItem
                key={community.id}
                value={community.id}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <CommunityAvatar community={community} className="h-6 w-6" />
                  <span className="truncate">{community.name}</span>
                  {community.is_group && (
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md">
                      Group
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isMobile && selectedCommunity?.is_group && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-9 bg-white/50 hover:bg-white/60 backdrop-blur-sm rounded-lg border-indigo-200"
            onClick={handleEditGroup}
          >
            <Settings2 className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Edit</span>
          </Button>
        )}
      </div>

      {!isMobile && selectedCommunity && (
        <MiniAppLinkButton
          community={selectedCommunity}
          onCopySuccess={() => {
            toast({
              title: "Link copied",
              description: "Mini app link has been copied to clipboard",
            });
          }}
        />
      )}

      {/* Create Community Dialog */}
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
  );
};
