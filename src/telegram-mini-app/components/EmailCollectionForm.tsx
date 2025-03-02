
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
  console.log("📧 Rendering EmailCollectionForm with userId:", telegramUserId);
  
  if (!telegramUserId) {
    console.error("❌ EmailCollectionForm: No telegramUserId provided!");
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <h3 className="font-bold">Missing User ID</h3>
        <p>Unable to proceed without Telegram user identification.</p>
      </div>
    );
  }
  
  return (
    <EmailForm
      telegramUserId={telegramUserId}
      firstName={firstName}
      lastName={lastName}
      username={username}
      photoUrl={photoUrl}
      onComplete={() => {
        console.log("📧 Email collection completed for user:", telegramUserId);
        onComplete();
      }}
    />
  );
};
