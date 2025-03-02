
import { useEffect } from "react";

interface LoadingStateManagerProps {
  communityLoading: boolean;
  userLoading: boolean;
  isCheckingUserData: boolean;
  setIsCheckingUserData: (isChecking: boolean) => void;
}

export const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  communityLoading,
  userLoading,
  isCheckingUserData,
  setIsCheckingUserData
}) => {
  // Reset checking state after data loads
  useEffect(() => {
    if (!communityLoading && !userLoading && isCheckingUserData) {
      console.log('🔄 All data loaded, resetting checking state');
      window.setTimeout(() => {
        setIsCheckingUserData(false);
      }, 100);
    }
  }, [communityLoading, userLoading, isCheckingUserData, setIsCheckingUserData]);

  return null; // Non-visual component
};
