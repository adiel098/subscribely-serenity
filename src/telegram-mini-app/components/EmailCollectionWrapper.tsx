
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
  console.log('🧩 EmailCollectionWrapper: Starting with user:', 
    telegramUser ? `ID: ${telegramUser.id}, Email: ${telegramUser.email}` : 'null');
  console.log('🧩 EmailCollectionWrapper: onComplete function exists:', !!onComplete);
  
  if (!telegramUser) {
    console.error('❌ EMAIL COLLECTION: No user data provided to wrapper');
    return null;
  }
  
  // Check if user already has an email (should never happen due to our router logic, but just in case)
  if (telegramUser.email) {
    console.warn('⚠️ EMAIL COLLECTION: User already has email, calling onComplete directly', telegramUser.email);
    console.log('📧 CRITICAL FIX: Calling onComplete immediately for user with email:', telegramUser.email);
    onComplete();
    return null;
  }
  
  // Ensure the Telegram ID is properly formatted
  const telegramUserId = telegramUser.id ? String(telegramUser.id).trim() : null;
  
  console.log('🔑 EmailCollectionWrapper - Raw Telegram ID:', telegramUser.id);
  console.log('🔑 EmailCollectionWrapper - Telegram ID Type:', typeof telegramUser.id);
  console.log('🔑 EmailCollectionWrapper - Processed Telegram ID:', telegramUserId);
  
  // Validate that the telegramUserId is a numeric string (proper Telegram ID format)
  if (!telegramUserId || !/^\d+$/.test(telegramUserId)) {
    console.error('❌ EMAIL COLLECTION: Invalid Telegram user ID format:', telegramUser.id);
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">User Identification Error</h2>
        <p className="text-gray-700 mb-2">
          Unable to properly identify your Telegram account.
        </p>
        <p className="text-sm text-gray-500">
          Please try restarting the app or contact support.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Technical details: Failed ID validation - Format: {typeof telegramUser.id}, Value: {JSON.stringify(telegramUser.id)}
        </p>
      </div>
    );
  }
  
  console.log('📝 EMAIL COLLECTION: Showing form for user ID:', telegramUserId);
  console.log('📝 EMAIL COLLECTION: User data:', {
    id: telegramUserId,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name,
    username: telegramUser.username,
    hasEmail: !!telegramUser.email
  });
  
  return (
    <EmailCollectionForm 
      telegramUserId={telegramUserId} 
      firstName={telegramUser.first_name}
      lastName={telegramUser.last_name}
      username={telegramUser.username}
      photoUrl={telegramUser.photo_url}
      onComplete={() => {
        console.log('📝 EMAIL COLLECTION: Form submitted successfully, calling parent onComplete');
        // Ensure we're calling the parent onComplete function
        if (onComplete) onComplete();
      }} 
    />
  );
};
