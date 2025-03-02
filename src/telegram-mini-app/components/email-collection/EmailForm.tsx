
import React, { useState } from "react";
import { motion } from "framer-motion";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";
import { useToast } from "@/components/ui/use-toast";
import { FormHeader } from "./FormHeader";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { PrivacyNote } from "./PrivacyNote";
import { validateEmail } from "../email-collection/emailFormUtils";

interface EmailFormProps {
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
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError(null);
    
    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📧 Submitting email for Telegram ID:', telegramUserId);
      
      // Submit the email to the database
      const success = await collectUserEmail(
        telegramUserId, 
        email,
        firstName,
        lastName,
        undefined, // communityId is optional
        username,
        photoUrl
      );
      
      if (success) {
        console.log('✅ Email collection successful, now redirecting to community content');
        toast({
          title: "Email saved successfully!",
          description: "You can now access the community content.",
        });
        
        // Important: Call onComplete to signal the parent component to proceed
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        throw new Error("Failed to save email");
      }
    } catch (err) {
      console.error('❌ Error saving email:', err);
      setError("Failed to save your email. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "We couldn't save your email. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border border-primary/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FormHeader firstName={firstName} />
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <EmailInput 
          email={email}
          setEmail={setEmail}
          error={error}
        />
        
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
      
      <PrivacyNote />
    </motion.div>
  );
};
