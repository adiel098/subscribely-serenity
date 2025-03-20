
import React, { useState, FormEvent } from "react";
import { FormHeader } from "./FormHeader";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { PrivacyNote } from "./PrivacyNote";
import { useEmailSubmit } from "./hooks/useEmailSubmit";
import { motion } from "framer-motion";

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
  const { error, isSubmitting, handleSubmit } = useEmailSubmit({
    telegramUserId,
    firstName,
    lastName,
    username,
    photoUrl,
    email,
    onComplete
  });

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <motion.div 
      className="p-8 translucent-card max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FormHeader 
        firstName={firstName}
        photoUrl={photoUrl} 
      />
      
      <motion.form 
        onSubmit={onFormSubmit} 
        className="space-y-6 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <EmailInput 
          email={email}
          setEmail={setEmail}
          error={error}
        />
        
        <SubmitButton isSubmitting={isSubmitting} />
        
        <PrivacyNote />
      </motion.form>
    </motion.div>
  );
};
