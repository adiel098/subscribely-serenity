
import { useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { checkUserExists } from "@/telegram-mini-app/services/userProfileService";
import { useToast } from "@/components/ui/use-toast";

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

  // Check if user exists and has email
  useEffect(() => {
    const checkUserData = async () => {
      if (!userLoading && telegramUser) {
        console.log('✅ User data loaded, checking if user exists in database');
        setIsCheckingUserData(true);
        
        try {
          if (!telegramUser.id || !/^\d+$/.test(telegramUser.id)) {
            console.error('❌ Invalid Telegram ID format for database check:', telegramUser.id);
            setErrorState("Invalid Telegram user ID format");
            setIsCheckingUserData(false);
            return;
          }
          
          const { exists, hasEmail } = await checkUserExists(telegramUser.id);
          console.log('📊 User exists in DB:', exists, 'Has email:', hasEmail);
          
          // Always show email form for new users (not in DB)
          if (!exists) {
            console.log('🆕 New user detected, directing to email collection');
            toast({
              title: "Welcome to our community!",
              description: "Please provide your email to continue.",
            });
            setShowEmailForm(true);
          } 
          // Also show email form for existing users without email
          else if (!hasEmail) {
            console.log('🔍 Existing user but missing email, requesting email info');
            toast({
              title: "Please provide your email",
              description: "We need your email address to continue."
            });
            setShowEmailForm(true);
          } else {
            console.log('✅ User exists and has email, proceeding to community page');
            setShowEmailForm(false);
          }
          setErrorState(null);
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          // Default to showing email form if there's an error checking the database
          toast({
            variant: "destructive",
            title: "Error checking user data",
            description: "We'll ask for your information to ensure access."
          });
          setShowEmailForm(true);
          setErrorState(null);
        } finally {
          setIsCheckingUserData(false);
        }
      }
    };

    checkUserData();
  }, [telegramUser, userLoading, setIsCheckingUserData, setShowEmailForm, setErrorState, toast]);

  return null; // This is a non-visual component
};
