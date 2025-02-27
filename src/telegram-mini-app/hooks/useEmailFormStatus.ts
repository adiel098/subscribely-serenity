
import { useState, useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { checkUserExists } from "@/telegram-mini-app/services/memberService";

export const useEmailFormStatus = (
  telegramUser: TelegramUser | null,
  userLoading: boolean
) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);

  useEffect(() => {
    const checkUserData = async () => {
      if (!userLoading && telegramUser) {
        console.log('✅ User data loaded, checking if user exists in database');
        setIsCheckingUserData(true);
        
        try {
          const { exists, hasEmail } = await checkUserExists(telegramUser.id);
          console.log('📊 User exists:', exists, 'Has email:', hasEmail);
          
          // Only show email form if user doesn't have an email
          setShowEmailForm(!hasEmail);
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          // If there's an error, fall back to checking if email exists in user object
          setShowEmailForm(!telegramUser.email);
        } finally {
          setIsCheckingUserData(false);
        }
      }
    };

    checkUserData();
  }, [telegramUser, userLoading]);

  const handleEmailFormComplete = () => {
    console.log('📧 Email form completed');
    setShowEmailForm(false);
  };

  return {
    showEmailForm,
    isCheckingUserData,
    handleEmailFormComplete
  };
};
