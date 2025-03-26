
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export interface MessageInputSectionProps {
  draftMessage: string;
  setDraftMessage: (message: string) => void;
  updateSettings: any;
  settingsKey: string;
  label: string;
  placeholder: string;
}

export const MessageInputSection = ({ 
  draftMessage,
  setDraftMessage,
  updateSettings,
  settingsKey,
  label,
  placeholder
}: MessageInputSectionProps) => {
  console.log(`MessageInputSection for ${settingsKey} - Current value:`, draftMessage);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftMessage(e.target.value);
    updateSettings.mutate({ [settingsKey]: e.target.value });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={settingsKey}>{label}</Label>
      <Textarea
        id={settingsKey}
        value={draftMessage}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
    </div>
  );
};
