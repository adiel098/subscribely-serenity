
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTelegramChannelInfo } from "@/telegram-mini-app/hooks/useTelegramChannelInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityAvatar } from "@/group_owners/components/community-selector/photo-handling/CommunityAvatar";

interface ConnectedChannelDisplayProps {
  community: {
    id: string;
    name: string;
    telegram_chat_id: string | null;
    telegram_photo_url?: string | null;
  };
  onAddAnotherGroup: () => void;
  onContinue: () => void;
  onRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
  isRefreshingPhoto: boolean;
}

export const ConnectedChannelDisplay: React.FC<ConnectedChannelDisplayProps> = ({
  community,
  onAddAnotherGroup,
  onContinue,
  onRefreshPhoto,
  isRefreshingPhoto
}) => {
  const { description, loading: descriptionLoading } = useTelegramChannelInfo({
    communityId: community.id,
    telegramChatId: community.telegram_chat_id
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border border-indigo-100 bg-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center">
                  {community && (
                    <CommunityAvatar
                      community={community as any}
                      isRefreshing={isRefreshingPhoto}
                      onRefresh={onRefreshPhoto}
                      size="lg"
                      showRefreshButton={true}
                    />
                  )}
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <MessageCircle size={14} />
                </motion.div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {community.name || "Connected Channel"}
                </h3>
                {descriptionLoading ? (
                  <Skeleton className="h-4 w-2/3 mt-2" />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {description || "No description available"}
                  </p>
                )}
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Successfully connected
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                onClick={onAddAnotherGroup}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Group
              </Button>
              
              <Button 
                className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 shadow-md"
                onClick={onContinue}
              >
                Continue to Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
