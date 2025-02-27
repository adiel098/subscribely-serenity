
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { Community } from "@/telegram-mini-app/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CommunityHeaderProps {
  community: Community;
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
        {community.telegram_photo_url ? (
          <AvatarImage
            src={community.telegram_photo_url}
            alt={community.name}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="bg-primary/10">
            <Crown className="h-12 w-12 text-primary" />
          </AvatarFallback>
        )}
      </Avatar>
      <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        {community.name}
      </h1>
      {community.description && (
        <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto">
          {community.description}
        </p>
      )}
    </div>
  );
};
