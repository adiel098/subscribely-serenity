
import React, { useState } from "react";
import { motion } from "framer-motion";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";
import { useToast } from "@/components/ui/use-toast";
import { FormHeader } from "./FormHeader";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { PrivacyNote } from "./PrivacyNote";
import { validateEmail } from "./emailFormUtils";

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

  console.log('📧 FLOW: EmailForm component rendering for user ID:', telegramUserId);
  console.log('📧 FLOW: EmailForm: onComplete function exists:', !!onComplete);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📧 FLOW: Form submitted with email:', email);
    
    // Clear any previous errors
    setError(null);
    
    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📧 FLOW: Submitting email for Telegram ID:', telegramUserId);
      
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
        console.log('✅ FLOW: Email collection successful, calling onComplete to show community content');
        toast({
          title: "Email saved successfully!",
          description: "You can now access the community content.",
        });
        
        // CRITICAL FIX: Call onComplete immediately and ensure it's executed
        console.log('🚨 FLOW: Directly calling onComplete in EmailForm');
        
        // Force immediate execution to ensure state updates propagate
        if (onComplete) {
          window.setTimeout(() => {
            onComplete();
            console.log('✅ FLOW: onComplete callback executed with a small delay');
          }, 0);
        }
      } else {
        throw new Error("Failed to save email");
      }
    } catch (err) {
      console.error('❌ FLOW: Error saving email:', err);
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
