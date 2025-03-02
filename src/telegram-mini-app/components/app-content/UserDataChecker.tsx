
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
        
        try {
          if (!telegramUser.id) {
            console.error('❌ Missing Telegram ID:', telegramUser);
            setErrorState("Missing Telegram user ID");
            setIsCheckingUserData(false);
            return;
          }
          
          // CRITICAL FIX: First check if the user already has an email directly in the object
          if (telegramUser.email) {
            console.log('📧 User already has email in object, skipping database check:', telegramUser.email);
            setShowEmailForm(false);
            setIsCheckingUserData(false);
            setErrorState(null);
            return;
          }
          
          // Set checking state
          setIsCheckingUserData(true);
          
          // Make sure we have a string ID
          const telegramId = String(telegramUser.id).trim();
          console.log('📱 Processed Telegram ID for user data check:', telegramId);
          
          if (!/^\d+$/.test(telegramId)) {
            console.error('❌ Invalid Telegram ID format for database check:', telegramId);
            console.error('❌ Full user object:', JSON.stringify(telegramUser));
            setErrorState("Invalid Telegram user ID format");
            setIsCheckingUserData(false);
            return;
          }
          
          // Check if user exists in the database
          const { exists, hasEmail } = await checkUserExists(telegramId);
          console.log('📊 User exists in DB:', exists, 'Has email:', hasEmail);
          
          // CRITICAL FIX: Additional logging for user state
          console.log('📧 Complete user state:', {
            id: telegramUser.id,
            email: telegramUser.email,
            firstName: telegramUser.first_name,
            existsInDB: exists,
            hasEmailInDB: hasEmail
          });
          
          // CRITICAL FIX: Show email form if user doesn't have email
          if (!exists || !hasEmail) {
            console.log('🔴 EMAIL REQUIRED: User needs to provide email before proceeding');
            
            if (!exists) {
              toast({
                title: "Welcome to our community!",
                description: "Please provide your email to continue.",
              });
            } else {
              toast({
                title: "Email required",
                description: "Please provide your email address to continue.",
              });
            }
            
            // Force showing email form - this is critical
            window.setTimeout(() => {
              setShowEmailForm(true);
              console.log('🚨 CRITICAL FIX: Forced showEmailForm to true in UserDataChecker');
            }, 0);
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
