
import { useEffect } from "react";

interface ErrorStateManagerProps {
  userError: Error | null;
  setErrorState: (error: string | null) => void;
}

export const ErrorStateManager: React.FC<ErrorStateManagerProps> = ({
  userError,
  setErrorState
}) => {
  // Handle user error
  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      setErrorState("User identification error. Please try reloading the app or contact support.");
    }
  }, [userError, setErrorState]);

  return null; // Non-visual component
};
