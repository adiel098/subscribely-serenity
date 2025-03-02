
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { isValidEmail } from "../emailFormUtils";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";

interface UseEmailSubmitProps {
  telegramUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  onComplete: () => void;
}

export const useEmailSubmit = ({
  telegramUserId,
  email,
  firstName,
  lastName,
  username,
  photoUrl,
  onComplete
}: UseEmailSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Reset error state
    setError(null);
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      console.log(`📧 Saving email ${email} for user ID: ${telegramUserId}`);
      setIsSubmitting(true);
      
      // Save email to database using the collectUserEmail service function
      const success = await collectUserEmail(
        telegramUserId, 
        email, 
        firstName,
        lastName,
        undefined, // communityId
        username,
        photoUrl
      );
      
      if (!success) {
        throw new Error("Failed to save email to database");
      }
      
      console.log(`✅ Email saved successfully for user ID: ${telegramUserId}`);
      
      // No toast notification for email saved - as requested
      
      // Trigger haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        console.log("📱 Triggering haptic feedback");
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      // Call onComplete to trigger redirection to the community page
      onComplete();
    } catch (error) {
      console.error("❌ Error saving email:", error);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error saving email",
        description: "Please try again or contact support."
      });
      
      setError("Failed to save your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit
  };
};
