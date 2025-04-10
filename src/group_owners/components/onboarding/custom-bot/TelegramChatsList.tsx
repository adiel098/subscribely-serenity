
import React, { useState } from "react";
import { TelegramChat, TelegramChatItem, TelegramChatSkeleton } from "./TelegramChatItem";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TelegramChatsListProps {
  chats: TelegramChat[];
  botToken: string;
  onChatsRefresh?: (newChats: TelegramChat[]) => void;
  disabled?: boolean;
}

export const TelegramChatsList: React.FC<TelegramChatsListProps> = ({
  chats,
  botToken,
  onChatsRefresh,
  disabled = false
}) => {
  const [refreshingPhotoId, setRefreshingPhotoId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState<boolean>(false);
  
  // Refresh photo for a specific chat
  const handleRefreshPhoto = async (chatId: string) => {
    if (!botToken) {
      toast.error("Bot token is required");
      return;
    }
    
    setRefreshingPhotoId(chatId);
    
    try {
      const response = await supabase.functions.invoke("get-telegram-channel-info", {
        body: { 
          botToken, 
          chatId 
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      if (response.data && response.data.success) {
        // Update the specific chat in the list
        const updatedChats = chats.map(chat => 
          chat.id === chatId ? { 
            ...chat, 
            photo_url: response.data.photoUrl || chat.photo_url,
            member_count: response.data.memberCount || chat.member_count,
            description: response.data.description || chat.description
          } : chat
        );
        
        if (onChatsRefresh) {
          onChatsRefresh(updatedChats);
        }
        
        toast.success("Channel information updated");
      } else {
        toast.error("Could not update channel photo");
      }
    } catch (error) {
      console.error("Error refreshing chat photo:", error);
      toast.error("Failed to update channel information");
    } finally {
      setRefreshingPhotoId(null);
    }
  };
  
  // Refresh all chats
  const handleRefreshAll = async () => {
    if (!botToken) {
      toast.error("Bot token is required");
      return;
    }
    
    setIsRefreshingAll(true);
    
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken,
          communityId: null
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      if (response.data && response.data.valid) {
        const newChats = response.data.chatList || [];
        
        if (onChatsRefresh && newChats.length > 0) {
          console.log("Refreshed chats:", {
            count: newChats.length,
            chats: newChats.map(c => ({id: c.id, title: c.title}))
          });
          onChatsRefresh(newChats);
          toast.success(`Refreshed ${newChats.length} ${newChats.length === 1 ? 'chat' : 'chats'} successfully`);
        } else {
          toast.warning("No chats found during refresh. Make sure your bot is an admin in at least one group or channel.");
        }
      } else {
        toast.error("Could not refresh chat list. Please check your bot token.");
      }
    } catch (error) {
      console.error("Error refreshing chat list:", error);
      toast.error("Failed to refresh chat list");
    } finally {
      setIsRefreshingAll(false);
    }
  };
  
  // Divide chats into channels and groups
  const channels = chats.filter(chat => chat.type === 'channel');
  const groups = chats.filter(chat => chat.type !== 'channel');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">
          {chats.length === 0 ? 'No chats found' : `Found ${chats.length} chat${chats.length > 1 ? 's' : ''}`}
        </h3>
        
        {chats.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshingAll || disabled}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshingAll ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      {isRefreshingAll ? (
        <div className="space-y-2">
          <TelegramChatSkeleton />
          <TelegramChatSkeleton />
        </div>
      ) : (
        <div className="space-y-4">
          {channels.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Channels</h4>
              <div className="space-y-2">
                {channels.map(chat => (
                  <TelegramChatItem
                    key={chat.id}
                    chat={chat}
                    onRefreshPhoto={handleRefreshPhoto}
                    isRefreshing={refreshingPhotoId === chat.id}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          )}
          
          {groups.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Groups</h4>
              <div className="space-y-2">
                {groups.map(chat => (
                  <TelegramChatItem
                    key={chat.id}
                    chat={chat}
                    onRefreshPhoto={handleRefreshPhoto}
                    isRefreshing={refreshingPhotoId === chat.id}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          )}
          
          {chats.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No Telegram channels or groups found. Make sure your bot is an admin in at least one group or channel.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
