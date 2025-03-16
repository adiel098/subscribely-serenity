
import React from "react";
import { Star } from "lucide-react";

interface CommunityNotFoundProps {
  communityId?: string;
  isCustomLink?: boolean;
}

export const CommunityNotFound: React.FC<CommunityNotFoundProps> = ({ 
  communityId,
  isCustomLink = false 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="text-center space-y-4 p-6 glass-card rounded-xl">
        <Star className="h-16 w-16 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-gray-600 text-lg">Community not found</p>
        {communityId && (
          <p className="text-sm text-gray-400">
            {isCustomLink ? "Custom link" : "ID"}: {communityId}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-4">
          Please check the link and try again
        </p>
      </div>
    </div>
  );
};
