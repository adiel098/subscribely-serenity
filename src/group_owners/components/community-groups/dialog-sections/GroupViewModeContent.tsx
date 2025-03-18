
import React from "react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Link, Edit, Users } from "lucide-react";

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
  onEditCommunities,
}) => {
  return (
    <div className="space-y-6 py-2">
      {/* Group Photo and Name */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-md bg-purple-100 border border-purple-200 overflow-hidden flex-shrink-0 shadow-sm">
          {group.telegram_photo_url ? (
            <img
              src={group.telegram_photo_url}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
          )}
        </div>
      </div>

      {/* Link section */}
      <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Link className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Group Link</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 hover:bg-purple-50 text-purple-600"
            onClick={onEditLink}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-white rounded border flex-1 text-xs truncate">{fullLink}</code>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={onCopyLink}
          >
            <Clipboard className="h-3.5 w-3.5 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      {/* Communities section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Communities in this Group</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 hover:bg-purple-50 text-purple-600"
            onClick={onEditCommunities}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        {communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {communities.map((community) => (
              <div
                key={community.id}
                className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded bg-purple-100 border border-purple-200 overflow-hidden flex-shrink-0">
                  {community.telegram_photo_url ? (
                    <img
                      src={community.telegram_photo_url}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium truncate">{community.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">No communities in this group yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs gap-1 hover:bg-purple-50 text-purple-600"
              onClick={onEditCommunities}
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
