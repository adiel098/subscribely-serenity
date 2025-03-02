
import { EmailCollectionForm } from "@/telegram-mini-app/components/EmailCollectionForm";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";

interface EmailCollectionWrapperProps {
  telegramUser: TelegramUser;
  onComplete: () => void;
}

export const EmailCollectionWrapper: React.FC<EmailCollectionWrapperProps> = ({ 
  telegramUser, 
  onComplete 
}) => {
  if (!telegramUser) {
    console.error('❌ EMAIL COLLECTION: No user data provided to wrapper');
    return null;
  }
  
  // Check if user already has an email (should never happen due to our router logic, but just in case)
  if (telegramUser.email) {
    console.warn('⚠️ EMAIL COLLECTION: User already has email, calling onComplete directly', telegramUser.email);
    // Call onComplete on next tick to avoid rendering issues
    setTimeout(onComplete, 0);
    return null;
  }
  
  console.log('📝 EMAIL COLLECTION: Showing form for user ID:', telegramUser.id);
  console.log('📝 EMAIL COLLECTION: User data:', {
    id: telegramUser.id,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name,
    username: telegramUser.username,
    hasEmail: !!telegramUser.email
  });
  
  return (
    <EmailCollectionForm 
      telegramUserId={telegramUser.id} 
      firstName={telegramUser.first_name}
      lastName={telegramUser.last_name}
      username={telegramUser.username}
      photoUrl={telegramUser.photo_url}
      onComplete={() => {
        console.log('📝 EMAIL COLLECTION: Form submitted successfully, completing flow');
        onComplete();
      }} 
    />
  );
};
