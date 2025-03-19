
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { CommunityAvatar } from "@/group_owners/components/community-selector/photo-handling/CommunityAvatar";

interface ConnectedCommunitiesListProps {
  communities: Array<{
    id: string;
    name: string;
    telegram_chat_id: string | null;
    telegram_photo_url?: string | null;
  }>;
  onRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
  isRefreshingPhoto: boolean;
}

export const ConnectedCommunitiesList: React.FC<ConnectedCommunitiesListProps> = ({
  communities,
  onRefreshPhoto,
  isRefreshingPhoto
}) => {
  if (!communities || communities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-6 space-y-4"
    >
      <h3 className="text-base font-medium">Previously Connected Communities:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {communities.map(community => (
          <div 
            key={community.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-indigo-100 bg-white/90 shadow-sm"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center">
              <CommunityAvatar
                community={community as any}
                size="sm"
                showRefreshButton={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {community.name}
              </p>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
