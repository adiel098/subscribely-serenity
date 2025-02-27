
import { Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { toast } from "sonner";

interface MessageInputSectionProps {
  settings: BotSettings;
  draftMessage: string;
  setDraftMessage: (message: string) => void;
  updateSettings: any;
}

export const MessageInputSection = ({ 
  settings,
  draftMessage,
  setDraftMessage,
  updateSettings
}: MessageInputSectionProps) => {
  
  const handleSave = () => {
    updateSettings.mutate({ 
      welcome_message: draftMessage
    });
    
    console.log("Saving welcome message:", draftMessage);
    toast.success("Welcome message saved successfully");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          When users start a conversation with your bot, they'll see this message and image (if provided).
        </p>
        <Textarea
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          placeholder="Enter your welcome message..."
          className="min-h-[100px]"
        />
      </div>
      
      <Button 
        onClick={handleSave}
        className="bg-green-500 hover:bg-green-600"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Message
      </Button>
    </div>
  );
};
