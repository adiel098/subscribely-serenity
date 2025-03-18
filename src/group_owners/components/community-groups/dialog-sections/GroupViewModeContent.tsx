
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Copy, FolderKanban, Link, Pencil, Users } from "lucide-react";

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
    <div className="space-y-5 py-1">
      {/* Group Photo */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 rounded-md overflow-hidden h-16 w-16 bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
          {group.telegram_photo_url ? (
            <img src={group.telegram_photo_url} alt={group.name} className="h-full w-full object-cover" />
          ) : (
            <FolderKanban className="h-8 w-8 text-purple-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{group.name}</h3>
          <p className="text-sm text-gray-600">{group.description || "אין תיאור לקבוצה זו"}</p>
        </div>
      </div>

      {/* Group Link */}
      <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Link className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">קישור שיתוף</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            onClick={onEditLink}
          >
            <Pencil className="h-3 w-3 mr-1" />
            ערוך
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-purple-200 rounded px-2 py-1.5 text-xs font-mono flex-1 truncate">
            {fullLink}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={onCopyLink}
          >
            <Copy className="h-3 w-3 mr-1" />
            העתק
          </Button>
        </div>
      </div>

      {/* Communities in group */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">קהילות בקבוצה</span>
            <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 text-xs">
              {communities?.length || 0}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            onClick={onEditCommunities}
          >
            <Pencil className="h-3 w-3 mr-1" />
            ערוך
          </Button>
        </div>
        
        {communities && communities.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto p-1">
            {communities.map(community => (
              <div 
                key={community.id}
                className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-100 hover:border-purple-200 transition-colors"
              >
                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-md overflow-hidden">
                  {community.telegram_photo_url ? (
                    <img src={community.telegram_photo_url} alt={community.name} className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-gray-400 m-1.5" />
                  )}
                </div>
                <span className="text-sm truncate">{community.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">אין קהילות בקבוצה זו עדיין 📭</p>
            <Button 
              variant="link" 
              className="text-xs text-purple-600 p-0 h-auto mt-1"
              onClick={onEditCommunities}
            >
              הוסף קהילות לקבוצה
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
