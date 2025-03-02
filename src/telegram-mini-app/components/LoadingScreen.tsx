
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export const LoadingScreen = () => {
  const [dots, setDots] = useState("");
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + "." : "");
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Track loading time
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Determine loading message based on time
  const getLoadingMessage = () => {
    if (loadingTime > 10) {
      return "Still loading, please be patient" + dots;
    } else {
      return "Loading amazing content" + dots;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="text-center space-y-4">
        <Sparkles className="h-12 w-12 text-primary animate-spin mx-auto" />
        <p className="text-primary/70">{getLoadingMessage()}</p>
        
        {loadingTime > 5 && (
          <p className="text-xs text-gray-500 mt-2">
            If loading persists, try refreshing the page
          </p>
        )}
      </div>
    </div>
  );
};
