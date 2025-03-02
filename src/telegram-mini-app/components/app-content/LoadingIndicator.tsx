
import React, { useState, useEffect } from "react";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";

interface LoadingIndicatorProps {
  isLoading: boolean;
  onTimeout: () => void;
  timeoutDuration?: number;
  onRetry: () => void;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  onTimeout,
  timeoutDuration = 15,
  onRetry
}) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Add loading timer to help detect long loads
  useEffect(() => {
    let interval: number | null = null;
    
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
      if (interval) window.clearInterval(interval);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isLoading]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loadingTime > timeoutDuration) {
      console.error('Loading timeout reached - forcing error state');
      onTimeout();
    }
  }, [loadingTime, timeoutDuration, onTimeout]);

  // Handle debug info visibility
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  if (!isLoading) return null;

  return (
    <div>
      <LoadingScreen />
      
      {/* Debug info that can be shown after clicking 5 times */}
      {loadingTime > 5 && (
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={toggleDebugInfo}
            className="bg-gray-800 text-white p-2 rounded-full text-xs"
          >
            {showDebugInfo ? "Hide Debug" : "Debug"}
          </button>
        </div>
      )}
      
      {showDebugInfo && (
        <div className="fixed bottom-12 right-4 bg-black/80 text-white p-3 rounded text-xs max-w-[300px] z-50">
          <h4 className="font-bold">Debug Info:</h4>
          <p>Loading time: {loadingTime}s</p>
          <button 
            onClick={onRetry}
            className="mt-2 bg-blue-500 text-white p-1 rounded text-xs w-full"
          >
            Force Retry
          </button>
        </div>
      )}
    </div>
  );
};
