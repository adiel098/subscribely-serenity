
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
  return (
    <EmailForm
      telegramUserId={telegramUserId}
      firstName={firstName}
      lastName={lastName}
      username={username}
      photoUrl={photoUrl}
      onComplete={onComplete}
    />
  );
};
