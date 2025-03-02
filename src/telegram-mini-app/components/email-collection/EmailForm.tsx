
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormHeader } from "./FormHeader";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { PrivacyNote } from "./PrivacyNote";
import { motion } from "framer-motion";
import { validateEmail, validateTelegramId } from "../email-collection/emailFormUtils";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const communityId = searchParams.get("start");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    console.log("🧪 DEBUG - Form submission with Telegram user ID:", telegramUserId);
    console.log("🧪 DEBUG - Telegram user ID type:", typeof telegramUserId);
    
    if (!telegramUserId) {
      console.error("❌ FORM ERROR: Missing Telegram user ID");
      toast({
        variant: "destructive",
        title: "User identification error",
        description: "Missing Telegram ID. Please try reloading the app.",
      });
      return;
    }
    
    const formattedTelegramId = String(telegramUserId).trim();
    
    if (!validateTelegramId(formattedTelegramId)) {
      console.error("❌ FORM ERROR: Invalid Telegram ID format:", formattedTelegramId);
      toast({
        variant: "destructive",
        title: "User identification error",
        description: "Invalid Telegram ID format. Please try reloading the app.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("📝 Saving email for telegram user:", formattedTelegramId, email);
      console.log("📝 With additional data:", { firstName, lastName, communityId, username, photoUrl });
      
      const success = await collectUserEmail(
        formattedTelegramId, 
        email, 
        firstName, 
        lastName, 
        communityId || undefined,
        username,
        photoUrl
      );
      
      if (!success) {
        throw new Error("Failed to save email");
      }
      
      console.log("✅ Email saved successfully for user:", formattedTelegramId);
      
      toast({
        title: "Email saved",
        description: "Thank you for providing your email",
      });
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      onComplete();
    } catch (error) {
      console.error("❌ Error saving email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your email. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-up">
      <motion.div 
        className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-md border border-purple-100"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <FormHeader />

        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailInput email={email} setEmail={setEmail} />
          <SubmitButton isSubmitting={isSubmitting} />
          <PrivacyNote />
        </form>
      </motion.div>
    </div>
  );
};
