
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { Community } from "@/pages/TelegramMiniApp";

interface CommunityHeaderProps {
  community: Community;
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
        <Crown className="h-8 w-8 text-primary" />
      </div>
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
