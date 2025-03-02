
import React, { useState, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormHeader } from "./FormHeader";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { PrivacyNote } from "./PrivacyNote";
import { isValidEmail } from "./emailFormUtils";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";
import { useEmailSubmit } from "./hooks/useEmailSubmit";

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
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
      <FormHeader 
        firstName={firstName}
        photoUrl={photoUrl} 
      />
      
      <form onSubmit={onFormSubmit} className="space-y-6 mt-6">
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
