
import React from "react";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Link as LinkIcon, Users } from "lucide-react";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("GroupViewModeContent");

interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface GroupViewModeContentProps {
  group: CommunityGroup;
  communities: Community[];
  channels?: Channel[];
  fullLink: string;
  onCopyLink: () => void;
  onEditLink: () => void;
  onEditCommunities: () => void;
}

export const GroupViewModeContent: React.FC<GroupViewModeContentProps> = ({
  group,
  communities,
  channels = [],
  fullLink,
  onCopyLink,
  onEditLink,
  onEditCommunities
}) => {
  // Prefer channels from edge function, fall back to communities from props if needed
  const displayChannels = channels.length > 0 ? channels : communities;
  
  logger.log("Group view mode content:", {
    groupId: group.id,
    channelsCount: channels.length,
    communitiesCount: communities.length,
    displayCount: displayChannels.length
  });
  
  return (
    <div className="space-y-6">
      {/* Group details section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Group Details</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Display basic group info */}
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {group.telegram_photo_url ? (
                <img 
                  src={group.telegram_photo_url} 
                  alt={group.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{group.name}</h4>
              {group.description && (
                <p className="text-gray-600 mt-1">{group.description}</p>
              )}
            </div>
          </div>
          
          {/* Display invite link */}
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Invite Link</span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEditLink}
                  className="h-8"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onCopyLink}
                  className="h-8"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="mt-2">
              <code className="p-2 bg-white rounded border border-gray-200 text-xs block overflow-x-auto">
                {fullLink}
              </code>
            </div>
          </div>
        </div>
      </div>
      
      {/* Communities section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Communities in this Group</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEditCommunities}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit Communities
          </Button>
        </div>
        
        {displayChannels.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
            {displayChannels.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center p-2 border border-gray-100 rounded-md bg-white hover:bg-gray-50"
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0 mr-3">
                  {('telegram_photo_url' in item && item.telegram_photo_url) ? (
                    <img 
                      src={item.telegram_photo_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  {(item.description || ('description' in item && item.description)) && (
                    <p className="text-gray-500 text-xs truncate max-w-[300px]">
                      {item.description || ('description' in item && item.description)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">No communities added to this group yet.</p>
            <Button 
              variant="link" 
              onClick={onEditCommunities}
              className="mt-2"
            >
              Add Communities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
