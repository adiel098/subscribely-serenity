
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Edit, PenLine, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityGroup;
  communities: Community[];
  fullLink: string;
  onCopyLink: () => void;
  onEditLink: () => void;
  onEditCommunities: () => void;
}

export const GroupDetailsDialog = ({
  isOpen,
  onClose,
  group,
  communities,
  fullLink,
  onCopyLink,
  onEditLink,
  onEditCommunities,
}: GroupDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {group.name}
            <Badge variant="outline" className="bg-purple-50 text-purple-700 ml-2">
              Group
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Group Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {group.description || "No description provided"}
            </p>
          </div>

          {/* Group Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Group Link</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={onEditLink}
              >
                <PenLine className="h-3 w-3" />
                Edit
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 p-2 rounded-md text-sm font-mono text-gray-700 overflow-x-auto">
                {fullLink}
              </div>
              <Button 
                size="sm" 
                className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" 
                onClick={onCopyLink}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>

          {/* Communities in group */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Communities in Group</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={onEditCommunities}
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </div>
            
            {communities && communities.length > 0 ? (
              <ScrollArea className="max-h-44 pr-4">
                <div className="space-y-2">
                  {communities.map((community) => (
                    <div key={community.id} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-100">
                      <div className="text-sm font-medium">{community.name}</div>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        {community.is_group ? "Group" : "Community"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">No communities added to this group</p>
                <Button 
                  variant="link" 
                  className="mt-1 text-indigo-600 text-xs gap-1" 
                  onClick={onEditCommunities}
                >
                  <Plus className="h-3 w-3" />
                  Add communities
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
