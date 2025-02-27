
import React from "react";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { Community } from "@/telegram-mini-app/types/community.types";

interface UserInfoCardProps {
  telegramUser: TelegramUser | null;
  community: Community;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ telegramUser, community }) => {
  if (!telegramUser) return null;

  return (
    <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-none shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 relative">
            {telegramUser.photo_url ? (
              <Avatar className="h-10 w-10 ring-2 ring-white">
                <AvatarImage 
                  src={telegramUser.photo_url} 
                  alt={telegramUser.first_name} 
                  className="object-cover"
                />
              </Avatar>
            ) : (
              <Avatar className="h-10 w-10 bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </Avatar>
            )}
            
            {/* Community avatar overlay */}
            {community.telegram_photo_url && (
              <div className="absolute -bottom-1 -right-1">
                <Avatar className="h-6 w-6 ring-1 ring-white">
                  <AvatarImage 
                    src={community.telegram_photo_url} 
                    alt={community.name}
                    className="object-cover" 
                  />
                  <AvatarFallback className="text-[8px] bg-primary/20">
                    {community.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-800 truncate">
              {telegramUser.first_name} {telegramUser.last_name || ''}
              {telegramUser.username && (
                <span className="text-xs text-indigo-600 ml-1">@{telegramUser.username}</span>
              )}
            </h3>
            {telegramUser.email && (
              <p className="text-xs text-gray-600 truncate">{telegramUser.email}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
