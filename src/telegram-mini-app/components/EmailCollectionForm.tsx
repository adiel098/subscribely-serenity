
import React from "react";
import { EmailForm } from "./email-collection/EmailForm";

interface EmailCollectionFormProps {
  telegramUserId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  onComplete: () => void;
}

export const EmailCollectionForm = ({ 
  telegramUserId, 
  firstName, 
  lastName, 
  username,
  photoUrl,
  onComplete 
}: EmailCollectionFormProps) => {
  console.log('📧 EmailCollectionForm: Rendering with telegramUserId:', telegramUserId);
  console.log('📧 EmailCollectionForm: onComplete function exists:', !!onComplete);
  
  return (
    <EmailForm
      telegramUserId={telegramUserId}
      firstName={firstName}
      lastName={lastName}
      username={username}
      photoUrl={photoUrl}
      onComplete={() => {
        console.log('📧 EmailCollectionForm: Email submitted successfully, calling onComplete');
        // Ensure onComplete is called correctly
        if (onComplete) onComplete();
      }}
    />
  );
};
