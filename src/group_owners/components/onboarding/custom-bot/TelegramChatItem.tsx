
import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface TelegramChat {
  id: string;
  title: string;
  type: string;
  photo_url?: string | null;
  username?: string | null;
  description?: string | null;
  member_count?: number;
  is_verified?: boolean;
}

interface TelegramChatItemProps {
  chat: TelegramChat;
  onRefreshPhoto?: (chatId: string) => void;
  isRefreshing?: boolean;
  disabled?: boolean;
}

export const TelegramChatItem: React.FC<TelegramChatItemProps> = ({ 
  chat, 
  onRefreshPhoto,
  isRefreshing = false,
  disabled = false
}) => {
  // Default placeholder for photos
  const photoPlaceholder = chat.type === 'channel' 
    ? '📢' // Channel icon
    : '👥'; // Group icon
    
  const handleRefresh = () => {
    if (onRefreshPhoto) {
      onRefreshPhoto(chat.id);
    }
  };
  
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
      <div className="relative flex-shrink-0">
        {chat.photo_url ? (
          <img 
            src={chat.photo_url} 
            alt={chat.title} 
            className="w-10 h-10 rounded-md object-cover"
            onError={(e) => {
              // If image fails to load, replace with placeholder
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling!.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Placeholder shown when no photo or on error */}
        <div 
          className={`${chat.photo_url ? 'hidden' : 'flex'} w-10 h-10 rounded-md bg-indigo-100 items-center justify-center text-xl`}
          aria-hidden="true"
        >
          {photoPlaceholder}
        </div>
        
        {/* Chat type indicator */}
        <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full px-1.5 py-0.5 text-xs font-medium border border-gray-200">
          {chat.type === 'channel' ? 'Channel' : 'Group'}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 truncate">{chat.title}</h4>
          
          {onRefreshPhoto && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing || disabled}
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh photo</span>
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 truncate">
          ID: {chat.id}
        </p>
        
        {chat.username && (
          <p className="text-xs text-gray-500">
            @{chat.username}
          </p>
        )}
        
        {chat.member_count !== undefined && (
          <div className="text-xs text-gray-500 mt-1">
            {chat.member_count} members
          </div>
        )}
      </div>
    </div>
  );
};

export const TelegramChatSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg border border-gray-200 bg-white">
      <Skeleton className="w-10 h-10 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};
