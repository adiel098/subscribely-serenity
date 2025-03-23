
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Hash, MessageSquare } from "lucide-react";
import { getProxiedImageUrl } from "@/admin/services/imageProxyService";

export interface TelegramChat {
  id: number;
  title: string;
  type: "channel" | "group" | "supergroup" | "private";
  username?: string;
  photo_url?: string;
}

interface TelegramChatItemProps {
  chat: TelegramChat;
}

export const TelegramChatItem: React.FC<TelegramChatItemProps> = ({ chat }) => {
  // Get the appropriate icon based on chat type
  const getChatIcon = () => {
    switch (chat.type) {
      case "channel":
        return <Hash className="h-4 w-4 text-blue-500" />;
      case "group":
      case "supergroup":
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get the chat type display text
  const getChatTypeText = () => {
    switch (chat.type) {
      case "channel":
        return "Channel";
      case "supergroup":
        return "Supergroup";
      case "group":
        return "Group";
      default:
        return chat.type.charAt(0).toUpperCase() + chat.type.slice(1);
    }
  };

  // Format avatar fallback text from title
  const getAvatarFallback = () => {
    return chat.title
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Process photo URL if exists
  const photoUrl = chat.photo_url ? getProxiedImageUrl(chat.photo_url) : null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
      <Avatar className="h-10 w-10 border border-gray-200">
        {photoUrl ? (
          <AvatarImage src={photoUrl} alt={chat.title} />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          {getAvatarFallback()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-800 truncate">{chat.title}</h4>
          {chat.username && (
            <span className="text-xs text-gray-500">@{chat.username}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 mt-0.5">
          {getChatIcon()}
          <span className="text-xs text-gray-600">{getChatTypeText()}</span>
          {chat.id && (
            <span className="text-xs text-gray-400 ml-1">ID: {chat.id}</span>
          )}
        </div>
      </div>
    </div>
  );
};
