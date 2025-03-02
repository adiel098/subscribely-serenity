
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
        console.log('📱 Telegram ID for validation:', telegramUser.id);
        console.log('📱 Telegram ID type:', typeof telegramUser.id);
        setIsCheckingUserData(true);
        
        try {
          if (!telegramUser.id) {
            console.error('❌ Missing Telegram ID:', telegramUser);
            setErrorState("Missing Telegram user ID");
            setIsCheckingUserData(false);
            return;
          }
          
          // Make sure we have a string ID
          const telegramId = String(telegramUser.id).trim();
          console.log('📱 Processed Telegram ID:', telegramId);
          
          if (!/^\d+$/.test(telegramId)) {
            console.error('❌ Invalid Telegram ID format for database check:', telegramId);
            console.error('❌ Full user object:', JSON.stringify(telegramUser));
            setErrorState("Invalid Telegram user ID format");
            setIsCheckingUserData(false);
            return;
          }
          
          // Only check if user exists, don't create the user here
          const { exists, hasEmail } = await checkUserExists(telegramId);
          console.log('📊 User exists in DB:', exists, 'Has email:', hasEmail);
          
          // Enforce email collection in ALL cases where either:
          // 1. User is new (not in DB) OR
          // 2. User exists but doesn't have an email
          if (!exists || !hasEmail) {
            console.log('🔴 EMAIL REQUIRED: User needs to provide email before proceeding');
            
            // Removed welcome toast notification
            
            // Force showing email form - this is critical
            setShowEmailForm(true);
          } else {
            console.log('✅ User exists and has email, proceeding to community page');
            // User has email, proceed directly to community page
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
