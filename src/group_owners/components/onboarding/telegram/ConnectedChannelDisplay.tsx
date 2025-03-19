
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, PartyPopper, Users } from "lucide-react";
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
  onContinue: () => void;
  onRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
  isRefreshingPhoto: boolean;
}

export const ConnectedChannelDisplay: React.FC<ConnectedChannelDisplayProps> = ({
  community,
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
      <Card className="overflow-hidden border border-indigo-100 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center flex-col gap-4 text-center py-4">
              <motion.div 
                className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Successfully Connected! 🎉
                </h3>
                <p className="text-gray-600">
                  Your Telegram community is now connected to Membify
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 p-4 bg-indigo-50 rounded-lg">
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
                    Connected and ready
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md"
                onClick={onContinue}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
