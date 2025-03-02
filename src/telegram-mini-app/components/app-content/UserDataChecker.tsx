
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

  // Simplified logic to determine whether to show email form or community content
  useEffect(() => {
    // Don't do anything while still loading
    if (userLoading) {
      console.log('⏳ FLOW: User data is still loading, waiting...');
      return;
    }
    
    // Make sure we have a valid user object
    if (!telegramUser) {
      console.error('❌ FLOW: No user data available');
      setErrorState("User data unavailable");
      setIsCheckingUserData(false);
      return;
    }
    
    console.log('📊 FLOW: User check complete - userExistsInDatabase=', userExistsInDatabase);
    
    // If user doesn't exist in database, show email form
    if (userExistsInDatabase === false) {
      console.log('🆕 FLOW: New user needs to provide email');
      toast({
        title: "Welcome to our community!",
        description: "Please provide your email to continue.",
      });
      setShowEmailForm(true);
    } else {
      // User exists in database, proceed to community content
      console.log('✅ FLOW: Existing user, showing community content');
      setShowEmailForm(false);
    }
    
    // Finish checking
    setIsCheckingUserData(false);
    setErrorState(null);
  }, [telegramUser, userLoading, userExistsInDatabase, setIsCheckingUserData, setShowEmailForm, setErrorState, toast]);

  return null; // This is a non-visual component
};
