
import React, { useState } from "react";
import { TelegramChat, TelegramChatItem } from "./TelegramChatItem";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TelegramChatsListProps {
  chats: TelegramChat[];
  botToken?: string;
  onChatsRefresh?: (newChats: TelegramChat[]) => void;
  disabled?: boolean;
}

export const TelegramChatsList: React.FC<TelegramChatsListProps> = ({ 
  chats, 
  botToken,
  onChatsRefresh,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshChats = async () => {
    if (!botToken) {
      toast.error("Bot token is required for refreshing chats");
      return;
    }
    
    setIsRefreshing(true);
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { botToken }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.valid && response.data.chatList) {
        if (onChatsRefresh) {
          onChatsRefresh(response.data.chatList);
        }
        toast.success(`Found ${response.data.chatList.length} chats`);
      } else {
        toast.error("Failed to refresh chats");
      }
    } catch (error: any) {
      console.error("Error refreshing chats:", error);
      toast.error("An error occurred while refreshing chats");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (!chats || chats.length === 0) {
    return (
      <Alert className="mt-4 bg-amber-50 border-amber-100">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">No New Groups or Channels Found</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p className="mb-3">
            No new communities were found. This can happen if:
            <ul className="list-disc ml-5 mt-2">
              <li>All your bot's communities are already added to your account</li>
              <li>Your bot isn't added to any new groups or channels yet</li>
              <li>Your bot doesn't have admin privileges in any new communities</li>
            </ul>
          </p>
          
          {botToken && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshChats}
              disabled={isRefreshing || disabled}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Searching...' : 'Refresh & Search for Chats'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Count each type
  const channelCount = chats.filter(chat => chat.type === 'channel').length;
  const groupCount = chats.filter(chat => chat.type !== 'channel').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <div className="p-4 bg-white border border-green-100 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-green-700">
              Bot Connected Successfully
            </h4>
          </div>
          
          {botToken && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshChats}
              disabled={isRefreshing || disabled}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
        
        <div className="p-3 bg-green-50 rounded border border-green-100 mb-3">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium">Verification Successful!</p>
              <p>Found {chats.length} new communities you can add. Click <strong>Save Communities</strong> to proceed.</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          New communities available to add: {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
          {channelCount > 0 && groupCount > 0 ? ` (${channelCount} ${channelCount === 1 ? 'channel' : 'channels'} and ${groupCount} ${groupCount === 1 ? 'group' : 'groups'})` : 
           channelCount > 0 ? ` (${channelCount} ${channelCount === 1 ? 'channel' : 'channels'})` :
           groupCount > 0 ? ` (${groupCount} ${groupCount === 1 ? 'group' : 'groups'})` : ''}:
        </p>
        
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          {chats.map((chat, index) => (
            <TelegramChatItem key={index} chat={chat} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
