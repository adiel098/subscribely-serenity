
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Edit2, ExternalLink, Users, Link } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";
import { GroupMembersEditSheet } from "./GroupMembersEditSheet";
import { GroupLinkEditDialog } from "./GroupLinkEditDialog";
import { useGroupMemberCommunities } from "@/group_owners/hooks/useGroupMemberCommunities";

interface GroupMiniAppLinkButtonProps {
  group: CommunityGroup;
  communities: Community[];
}

export const GroupMiniAppLinkButton = ({ group, communities: initialCommunities }: GroupMiniAppLinkButtonProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMembersEditOpen, setIsMembersEditOpen] = useState(false);
  const [isLinkEditOpen, setIsLinkEditOpen] = useState(false);
  const [customLink, setCustomLink] = useState(group.custom_link);
  
  // Use the hook to get and refresh member communities
  const { communities, isLoading, communityIds } = useGroupMemberCommunities(group.id);
  
  const botUsername = getBotUsername();
  
  // Ensure we use the "group_" prefix for group IDs
  const baseUrl = `https://t.me/${botUsername}?start=`;
  const fullLink = `${baseUrl}${customLink || `group_${group.id}`}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleCommunitiesUpdated = () => {
    // This will refetch the communities data
    window.location.reload();
  };

  const handleLinkUpdated = (newLink: string | null) => {
    setCustomLink(newLink);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleCopyLink} 
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8 font-medium"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Group Link
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setIsDetailsOpen(true)} 
            size="sm"
            variant="outline"
            className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Details
          </Button>
        </motion.div>
      </div>

      {/* Group Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Group Details: {group.name}</DialogTitle>
            <DialogDescription>
              This group contains {communities.length} communities that users can join with a single subscription.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-2 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Mini App Link:</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs h-7 px-2 text-indigo-600"
                  onClick={() => setIsLinkEditOpen(true)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit Link
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-sm break-all bg-background p-2 rounded border flex-1">
                  {fullLink}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="shrink-0"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Communities in this group:</h4>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs h-7 px-2 text-indigo-600"
                  onClick={() => setIsMembersEditOpen(true)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit Communities
                </Button>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {communities.map(community => (
                  <Card key={community.id} className="shadow-sm">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm">{community.name}</CardTitle>
                    </CardHeader>
                    {community.description && (
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-2">{community.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
                
                {communities.length === 0 && (
                  <div className="col-span-2 text-center p-6 border rounded-md border-dashed">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No communities added to this group yet.</p>
                    <Button 
                      className="mt-2" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsMembersEditOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Communities
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Members Edit Sheet */}
      <GroupMembersEditSheet 
        isOpen={isMembersEditOpen} 
        onClose={() => setIsMembersEditOpen(false)} 
        group={group}
        currentCommunities={communities}
        onCommunitiesUpdated={handleCommunitiesUpdated}
      />
      
      {/* Link Edit Dialog */}
      <GroupLinkEditDialog 
        isOpen={isLinkEditOpen} 
        onClose={() => setIsLinkEditOpen(false)} 
        groupId={group.id}
        currentCustomLink={customLink}
        onLinkUpdated={handleLinkUpdated}
      />
    </>
  );
};
