
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  showAddMoreButton?: boolean;
  onAddMoreClick?: () => void;
}

export const ConnectedCommunitiesList: React.FC<ConnectedCommunitiesListProps> = ({
  communities,
  onRefreshPhoto,
  isRefreshingPhoto,
  showAddMoreButton = false,
  onAddMoreClick
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
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800">
          {communities.length > 1 
            ? `${communities.length} Connected Communities:`
            : "Previously Connected Community:"}
        </h3>
        
        {showAddMoreButton && onAddMoreClick && (
          <Button 
            onClick={onAddMoreClick}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 text-sm"
            size="sm"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {communities.map((community, index) => (
          <motion.div 
            key={community.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-center gap-3 p-3 rounded-lg border border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center">
              <CommunityAvatar
                community={community as any}
                size="sm"
                showRefreshButton={false}
                isRefreshing={isRefreshingPhoto}
                onRefresh={onRefreshPhoto}
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
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
