
import { MessageSquare, Image, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";
import { MessageInputSection } from "./welcome-message/MessageInputSection";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcome_message);
  const [welcomeImage, setWelcomeImage] = useState(settings.welcome_image);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleAutoWelcomeChange = (value: boolean) => {
    updateSettings.mutate({ auto_welcome_message: value });
  };

  return (
    <AccordionItem value="welcome" className="border rounded-lg">
      <AccordionTrigger className="px-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Welcome Message</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-welcome"
              checked={settings.auto_welcome_message}
              onCheckedChange={handleAutoWelcomeChange}
            />
            <Label htmlFor="auto-welcome">
              Automatically send welcome message to new members
            </Label>
          </div>

          <MessageInputSection
            draftMessage={welcomeMessage}
            setDraftMessage={setWelcomeMessage}
            updateSettings={updateSettings}
            settingsKey="welcome_message"
            label="Welcome Message"
            placeholder="Enter a welcome message for new members..."
          />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Welcome Image
            </Label>
            <ImageUploadSection
              image={welcomeImage}
              setImage={setWelcomeImage}
              updateSettings={updateSettings}
              settingsKey="welcome_image"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              imageError={imageError}
              setImageError={setImageError}
              label="Welcome Image"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
