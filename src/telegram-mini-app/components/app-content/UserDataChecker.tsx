
import { useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { useToast } from "@/components/ui/use-toast";

interface UserDataCheckerProps {
  telegramUser: TelegramUser | null;
  userLoading: boolean;
  userExistsInDatabase: boolean | null;
  setIsCheckingUserData: (isChecking: boolean) => void;
  setShowEmailForm: (show: boolean) => void;
  setErrorState: (error: string | null) => void;
}

export const UserDataChecker: React.FC<UserDataCheckerProps> = ({
  telegramUser,
  userLoading,
  userExistsInDatabase,
  setIsCheckingUserData,
  setShowEmailForm,
  setErrorState
}) => {
  const { toast } = useToast();

  // Logic to determine whether to show email form or community content
  useEffect(() => {
    // Don't do anything while still loading
    if (userLoading) {
      console.log('⏳ FLOW: User data is still loading, waiting...');
      return;
    }
    
    // Make sure we have a valid user object
    if (!telegramUser || !telegramUser.id) {
      console.error('❌ FLOW: No valid user data available - cannot proceed', telegramUser);
      setErrorState("User data unavailable. Please try refreshing the page.");
      setIsCheckingUserData(false);
      return;
    }
    
    console.log('📊 FLOW: User check complete - userExistsInDatabase=', userExistsInDatabase);
    
    // Handle new users - need to collect email
    if (userExistsInDatabase === false) {
      console.log('🆕 FLOW: New user detected - will show email collection form');
      setShowEmailForm(true);
      // Don't set an error state for new users - it's an expected flow
      setErrorState(null);
      toast({
        title: "Welcome to our community!",
        description: "Please provide your email to continue.",
      });
    } 
    // Handle existing users - proceed to community content
    else if (userExistsInDatabase === true) {
      console.log('✅ FLOW: Existing user found - showing community content');
      setShowEmailForm(false);
      setErrorState(null);
    }
    // Handle edge case - userExistsInDatabase is null
    else {
      console.error('❓ FLOW: Unexpected state - userExistsInDatabase is null');
      setErrorState("User verification error. Please try again.");
    }
    
    // Finish checking
    setIsCheckingUserData(false);
  }, [telegramUser, userLoading, userExistsInDatabase, setIsCheckingUserData, setShowEmailForm,
       setErrorState, toast]);

  return null; // This is a non-visual component
};
