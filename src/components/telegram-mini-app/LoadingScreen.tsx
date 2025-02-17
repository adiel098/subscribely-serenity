
import React from "react";
import { Sparkles } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="animate-pulse text-center space-y-4">
        <Sparkles className="h-12 w-12 text-primary animate-spin mx-auto" />
        <p className="text-primary/70 animate-pulse">Loading amazing content...</p>
      </div>
    </div>
  );
};
