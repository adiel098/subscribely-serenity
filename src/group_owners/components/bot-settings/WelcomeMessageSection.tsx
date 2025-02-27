
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState, useEffect } from "react";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";
import { MessageInputSection } from "./welcome-message/MessageInputSection";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [draftMessage, setDraftMessage] = useState(settings.welcome_message || "");
  const [welcomeImage, setWelcomeImage] = useState<string>(settings.welcome_image || "");
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Update local state when settings change
  useEffect(() => {
    setDraftMessage(settings.welcome_message || "");
    setWelcomeImage(settings.welcome_image || "");
  }, [settings.welcome_message, settings.welcome_image]);

  return (
    <AccordionItem value="welcome" className="border rounded-lg">
      <AccordionTrigger className="px-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Welcome Message</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Message Settings</CardTitle>
            <CardDescription>
              Customize the message and image new members receive when they join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadSection 
              welcomeImage={welcomeImage}
              setWelcomeImage={setWelcomeImage}
              updateSettings={updateSettings}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              imageError={imageError}
              setImageError={setImageError}
            />
            
            <MessageInputSection 
              settings={settings}
              draftMessage={draftMessage}
              setDraftMessage={setDraftMessage}
              updateSettings={updateSettings}
            />
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
