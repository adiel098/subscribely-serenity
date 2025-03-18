
import React from "react";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GroupViewModeContentProps {
  group: CommunityGroup;
  communities: Community[];
  fullLink: string;
  onCopyLink: () => void;
  onEditLink: () => void;
  onEditCommunities: () => void;
}

export const GroupViewModeContent: React.FC<GroupViewModeContentProps> = ({
  group,
  communities,
  fullLink,
  onCopyLink,
  onEditLink,
  onEditCommunities
}) => {
  return (
    <div className="space-y-6">
      {/* Group Info Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-600">Group Information</h3>
          <Button variant="ghost" size="sm" onClick={onEditLink} className="h-8">
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Name</h4>
            <p className="text-sm">{group.name}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Custom Link</h4>
            <p className="text-sm">{group.custom_link || "None"}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">Description</h4>
          <p className="text-sm">{group.description || "No description provided"}</p>
        </div>
        
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">Full Link</h4>
          <div className="flex items-center mt-1">
            <div className="flex-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 mr-2 truncate">
              {fullLink}
            </div>
            <Button variant="outline" size="sm" onClick={onCopyLink} className="h-8 whitespace-nowrap">
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </div>
      
      {/* Communities Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-600" />
            Communities in this Group
          </h3>
          <Button variant="ghost" size="sm" onClick={onEditCommunities} className="h-8">
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
        
        {communities && communities.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {communities.map(community => (
              <Card key={community.id} className="overflow-hidden">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded-md overflow-hidden">
                    {community.telegram_photo_url ? (
                      <img src={community.telegram_photo_url} alt={community.name} className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-gray-400 m-2" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{community.name}</p>
                    {community.description && (
                      <p className="text-xs text-gray-500 truncate">{community.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500 text-sm">No communities added to this group yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditCommunities} 
              className="mt-2"
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              Add Communities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
