
import React from "react";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GroupSuccessBanner } from "../group-success/GroupSuccessBanner";
import { Channel } from "@/group_owners/utils/channelTransformers";
import { CommunityList } from "./community-selection/CommunityList";
import { Sparkles, Users, Camera, Link, Type, FileText, Edit, Star, Search, Plus } from "lucide-react";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("SingleTabGroupContent");

interface SingleTabGroupContentProps {
  group: CommunityGroup;
  isEditing: boolean;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  photoUrl: string;
  setPhotoUrl: (photoUrl: string) => void;
  customLink: string;
  setCustomLink: (customLink: string) => void;
  allCommunities: Community[];
  selectedCommunityIds: string[];
  toggleCommunity: (communityId: string) => void;
  isLoadingCommunities: boolean;
  channels: Channel[];
  fullLink: string;
  onCopyLink: () => void;
  onEditLink: () => void;
}

export const SingleTabGroupContent: React.FC<SingleTabGroupContentProps> = ({
  group,
  isEditing,
  name,
  setName,
  description,
  setDescription,
  photoUrl,
  setPhotoUrl,
  customLink,
  setCustomLink,
  allCommunities,
  selectedCommunityIds,
  toggleCommunity,
  isLoadingCommunities,
  channels,
  fullLink,
  onCopyLink,
  onEditLink,
}) => {
  // Ensure communities is an array and filter out group communities
  const filteredCommunities = Array.isArray(allCommunities) 
    ? allCommunities.filter(c => !c.is_group) 
    : [];

  // Ensure channels is always an array
  const displayChannels = Array.isArray(channels) ? channels : [];

  // For future implementation of file upload
  const handlePhotoUpload = () => {
    // Placeholder for the actual upload functionality
    alert("Photo upload functionality coming soon! 📸");
  };

  if (isEditing) {
    return (
      <div className="space-y-6 py-2">
        {/* Group Details Section */}
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-medium flex items-center gap-2 text-purple-700">
            <Sparkles className="h-5 w-5 text-purple-500" />
            ✨ Group Details
          </h3>
          
          {/* Group Photo */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Camera className="h-4 w-4 text-purple-600" />
              Group Photo 🖼️
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 rounded-md overflow-hidden h-16 w-16 bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
                {photoUrl ? (
                  <img src={photoUrl} alt="Group" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Enter photo URL"
                  className="mb-2"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-xs gap-1 text-purple-600 hover:bg-purple-50"
                  onClick={handlePhotoUpload}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Type className="h-4 w-4 text-purple-600" />
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border-purple-200 focus:border-purple-400"
              required
            />
          </div>

          {/* Custom Link */}
          <div className="space-y-2">
            <Label htmlFor="customLink" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Link className="h-4 w-4 text-purple-600" />
              Custom Link Identifier 🔗
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Link className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="customLink"
                value={customLink}
                onChange={(e) => setCustomLink(e.target.value)}
                placeholder="e.g. premium_group"
                className="pl-10 font-mono border-purple-200 focus:border-purple-400"
              />
            </div>
            <p className="text-xs text-gray-500">
              Leave blank to use the default ID. Custom links make your group easier to share 🔗
            </p>
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4 text-purple-600" />
              Description 📝
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this group of communities"
              rows={3}
              className="resize-none w-full border-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-gray-500">
              Describe what makes this group special ✨
            </p>
          </div>
        </div>

        {/* Communities Section */}
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-medium flex items-center gap-2 text-purple-700">
            <Users className="h-5 w-5 text-purple-500" />
            👥 Group Communities
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Select communities to include in this group:
              </p>
              <div className="bg-purple-100 px-3 py-1 rounded-full text-xs font-medium text-purple-700">
                {selectedCommunityIds.length} selected
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communities..."
                className="pl-9 border-purple-200 focus:border-purple-400"
              />
            </div>
            
            {isLoadingCommunities ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                <p className="mt-2 text-sm text-gray-500">Loading communities...</p>
              </div>
            ) : filteredCommunities.length > 0 ? (
              <CommunityList
                communities={filteredCommunities}
                selectedCommunityIds={selectedCommunityIds}
                toggleCommunity={toggleCommunity}
              />
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No communities available to add</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View mode content
  return (
    <div className="space-y-6 py-2">
      {/* Group Details Section */}
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-purple-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center gap-2 text-purple-700">
            <Star className="h-5 w-5 text-purple-500" />
            ✨ Group Details
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEditLink}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit Group
          </Button>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-purple-100 shadow-sm">
            {group.telegram_photo_url ? (
              <img 
                src={group.telegram_photo_url} 
                alt={group.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-xl text-gray-800">{group.name}</h4>
            {group.description && (
              <p className="text-gray-600 mt-1 text-sm">{group.description}</p>
            )}
            <div className="mt-3">
              <GroupSuccessBanner 
                groupId={group.id}
                customLink={group.custom_link || null}
                onOpenEditDialog={onEditLink}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Communities Section */}
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-purple-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center gap-2 text-purple-700">
            <Users className="h-5 w-5 text-purple-500" />
            👥 Communities in this Group
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEditLink}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Manage Communities
          </Button>
        </div>
        
        {displayChannels.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {displayChannels.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center p-3 border border-purple-100 rounded-md bg-white hover:bg-purple-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 mr-3 border border-gray-200">
                  {item.telegram_photo_url ? (
                    <img 
                      src={item.telegram_photo_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                  {item.description && (
                    <p className="text-gray-500 text-xs truncate max-w-[300px]">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No communities added to this group yet</p>
            <Button 
              variant="outline" 
              onClick={onEditLink}
              className="mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Communities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
