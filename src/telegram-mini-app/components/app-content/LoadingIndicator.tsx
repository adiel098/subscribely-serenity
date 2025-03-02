
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

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
      interval = window.setTimeout(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
      if (interval) window.clearTimeout(interval);
    }
    
    return () => {
      if (interval) window.clearTimeout(interval);
    };
  }, [isLoading]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loadingTime > timeoutDuration) {
      console.error('Loading timeout reached - forcing error state');
      onTimeout();
    }
  }, [loadingTime, timeoutDuration, onTimeout]);

  // Only show retry debugging tool, not the loading animation
  if (!isLoading || loadingTime < 3) return null;

  return (
    <AnimatePresence>
      {isLoading && loadingTime >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.button 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="bg-gray-800/80 backdrop-blur-sm text-white p-2 rounded-full text-xs shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showDebugInfo ? "Hide Debug" : "Debug"}
          </motion.button>
          
          {showDebugInfo && (
            <motion.div 
              className="fixed bottom-14 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg text-xs max-w-[300px] z-50 border border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <h4 className="font-bold">Debug Info:</h4>
              <p>Loading time: {loadingTime}s</p>
              <motion.button 
                onClick={onRetry}
                className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded text-xs w-full flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="h-3 w-3" />
                <span>Force Retry</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
