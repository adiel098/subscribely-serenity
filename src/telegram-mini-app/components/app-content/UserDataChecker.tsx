
import { useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { useUserDataValidation } from "./hooks/useUserDataValidation";

interface UserDataCheckerProps {
  telegramUser: TelegramUser | null;
  userLoading: boolean;
  setIsCheckingUserData: (isChecking: boolean) => void;
  setShowEmailForm: (show: boolean) => void;
  setErrorState: (error: string | null) => void;
}

export const UserDataChecker: React.FC<UserDataCheckerProps> = ({
  telegramUser,
  userLoading,
  setIsCheckingUserData,
  setShowEmailForm,
  setErrorState
}) => {
  const { validateUserData } = useUserDataValidation({
    setIsCheckingUserData,
    setShowEmailForm,
    setErrorState
  });

  // Check if user exists and has email
  useEffect(() => {
    if (!userLoading && telegramUser) {
      console.log('✅ User data loaded, checking if user exists in database');
      validateUserData(telegramUser);
    }
  }, [telegramUser, userLoading, validateUserData]);

  // Log when user state changes
  useEffect(() => {
    if (telegramUser) {
      console.log('👤 UserDataChecker - User data changed:', {
        id: telegramUser.id,
        username: telegramUser.username,
        email: telegramUser.email
      });
    }
  }, [telegramUser]);

  return null; // This is a non-visual component
};
