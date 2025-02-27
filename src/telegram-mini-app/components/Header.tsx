
import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";

interface HeaderProps {
  telegramUser: TelegramUser | null;
}

export const Header: React.FC<HeaderProps> = ({ telegramUser }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-primary/10">
      <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        Membify
      </div>
      
      {telegramUser && (
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <h3 className="font-medium text-sm">
              {telegramUser.first_name} {telegramUser.last_name || ''}
            </h3>
            {telegramUser.username && (
              <p className="text-xs text-muted-foreground">
                @{telegramUser.username}
              </p>
            )}
          </div>
          <Avatar className="h-10 w-10">
            {telegramUser.photo_url ? (
              <AvatarImage
                src={telegramUser.photo_url}
                alt={telegramUser.first_name}
              />
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
    </div>
  );
};

