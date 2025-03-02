
import React, { useState, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormHeader } from "./FormHeader";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { PrivacyNote } from "./PrivacyNote";
import { isValidEmail } from "./emailFormUtils";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";

export interface EmailFormProps {
  telegramUserId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  onComplete: () => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  telegramUserId,
  firstName,
  lastName,
  username,
  photoUrl,
  onComplete
}) => {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
      <FormHeader 
        firstName={firstName}
        photoUrl={photoUrl} 
      />
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <EmailInput 
          email={email}
          setEmail={setEmail}
          error={error}
        />
        
        <SubmitButton isSubmitting={isSubmitting} />
        
        <PrivacyNote />
      </form>
    </div>
  );
};
