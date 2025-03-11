
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Edit2, ExternalLink } from "lucide-react";
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

interface GroupMiniAppLinkButtonProps {
  group: CommunityGroup;
  communities: Community[];
}

export const GroupMiniAppLinkButton = ({ group, communities }: GroupMiniAppLinkButtonProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const baseUrl = "https://t.me/SubscribelyBot?start=group_";
  const fullLink = `${baseUrl}${group.id}`;

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
              <p className="font-medium text-sm">Mini App Link:</p>
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
              <h4 className="font-medium mb-2">Communities in this group:</h4>
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
    </>
  );
};
