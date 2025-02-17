import React from "react";
import { Star } from "lucide-react";

export const CommunityNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="text-center space-y-4 p-6 glass-card rounded-xl">
        <Star className="h-16 w-16 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-gray-600 text-lg">Community not found</p>
      </div>
    </div>
  );
};
