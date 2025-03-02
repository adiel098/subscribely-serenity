
import { useEffect, useState } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { checkUserExists } from "@/telegram-mini-app/services/userProfileService";
import { useToast } from "@/components/ui/use-toast";
import { isValidTelegramId } from "@/telegram-mini-app/utils/telegramUtils";

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
  const { toast } = useToast();
  const [checkedOnce, setCheckedOnce] = useState(false);

  // Check if user exists and has email
  useEffect(() => {
    const checkUserData = async () => {
      if (!userLoading && telegramUser && !checkedOnce) {
        console.log('✅ User data loaded, checking if user exists in database');
        setIsCheckingUserData(true);
        
        try {
          // Always default to showing email form for new users
          let shouldShowEmailForm = true;
          
          // Use the utility function to validate Telegram ID
          if (!telegramUser.id || !isValidTelegramId(telegramUser.id)) {
            console.error('❌ Invalid Telegram ID format for database check:', telegramUser.id);
            console.error('❌ Type of ID:', typeof telegramUser.id);
            
            // In development mode, be more forgiving
            if (process.env.NODE_ENV === 'development' || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1') {
              
              console.log('🔧 Development mode: Showing email form despite invalid ID');
              setShowEmailForm(true);
              setErrorState(null);
              setIsCheckingUserData(false);
              setCheckedOnce(true);
              return;
            }
            
            setErrorState("Invalid Telegram user ID format");
            setIsCheckingUserData(false);
            return;
          }
          
          // Only check the database if we have a valid ID
          const { exists, hasEmail } = await checkUserExists(telegramUser.id);
          console.log('📊 User exists:', exists, 'Has email:', hasEmail);
          
          // If user exists in DB and has an email, don't show email form
          if (exists && hasEmail) {
            console.log('✅ User exists and has email, proceeding to community page');
            shouldShowEmailForm = false;
          } else {
            console.log('🔍 User needs to provide email before proceeding');
            toast({
              title: "Please provide your email",
              description: "We need your email address to continue."
            });
          }
          
          setShowEmailForm(shouldShowEmailForm);
          setErrorState(null);
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          // Default to showing email form if there's an error checking the database
          console.log('⚠️ Error checking user data, showing email form as fallback');
          toast({
            variant: "destructive",
            title: "Error checking user data",
            description: "We'll ask for your information again to ensure access."
          });
          setShowEmailForm(true);
          setErrorState(null);
        } finally {
          setIsCheckingUserData(false);
          setCheckedOnce(true);
        }
      }
    };

    checkUserData();
  }, [telegramUser, userLoading, setIsCheckingUserData, setShowEmailForm, setErrorState, toast, checkedOnce]);

  return null; // This is a non-visual component
};
