
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Edit2, Plus, Users } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";

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
  onEditCommunities
}: GroupDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                onClick={onEditLink}
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
                onClick={onCopyLink}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <GroupCommunitiesList 
            communities={communities} 
            onEditCommunities={onEditCommunities} 
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface GroupCommunitiesListProps {
  communities: Community[];
  onEditCommunities: () => void;
}

const GroupCommunitiesList = ({ communities, onEditCommunities }: GroupCommunitiesListProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Communities in this group:</h4>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-xs h-7 px-2 text-indigo-600"
          onClick={onEditCommunities}
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
              onClick={onEditCommunities}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Communities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
