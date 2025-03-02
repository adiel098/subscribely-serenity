
import React from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface UserProfileCardProps {
  telegramUser: TelegramUser | null;
  community: any;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ telegramUser, community }) => {
  if (!telegramUser) return null;

  return (
    <Card className="bg-gradient-to-r from-[#9b87f5]/20 to-[#D946EF]/10 border-[#8B5CF6]/30 overflow-hidden relative">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {telegramUser.photo_url ? (
              <Avatar className="h-10 w-10 border-2 border-[#9b87f5]/50">
                <AvatarImage 
                  src={telegramUser.photo_url} 
                  alt={telegramUser.first_name} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#8B5CF6]/20 text-[#8B5CF6]">
                  {telegramUser.first_name?.[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-10 w-10 bg-[#8B5CF6]/20 border-2 border-[#9b87f5]/50">
                <AvatarFallback>
                  <User className="h-5 w-5 text-[#8B5CF6]" />
                </AvatarFallback>
              </Avatar>
            )}
            
            {/* Community logo overlay */}
            {community.telegram_photo_url && (
              <div className="absolute -bottom-1 -right-1 border-2 border-white rounded-full overflow-hidden h-6 w-6">
                <img 
                  src={community.telegram_photo_url} 
                  alt={community.name} 
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-[#1A1F2C]">
              {telegramUser.first_name} {telegramUser.last_name || ''}
              {telegramUser.username && (
                <span className="text-xs text-[#6E59A5] ml-1">@{telegramUser.username}</span>
              )}
            </h3>
            {telegramUser.email && (
              <p className="text-xs text-[#7E69AB]">{telegramUser.email}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
