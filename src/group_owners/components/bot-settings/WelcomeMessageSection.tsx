
import { MessageSquare, Image, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";
import { MessageInputSection } from "./welcome-message/MessageInputSection";
import { toast } from "sonner";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcome_message);
  const [welcomeImage, setWelcomeImage] = useState(settings.welcome_image);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleSaveWelcomeMessage = () => {
    updateSettings.mutate({ 
      welcome_message: welcomeMessage,
      welcome_image: welcomeImage,
      auto_welcome_message: true // Always set to true as per requirement
    });
    toast.success("Welcome message saved successfully");
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
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              A welcome message will be automatically sent to new members when they join.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Enter a welcome message for new members..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Welcome Image
            </Label>
            <ImageUploadSection
              image={welcomeImage}
              setImage={setWelcomeImage}
              updateSettings={{ mutate: () => {} }} // Prevent auto-update
              settingsKey="welcome_image"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              imageError={imageError}
              setImageError={setImageError}
              label="Welcome Image"
            />
          </div>

          <Button 
            onClick={handleSaveWelcomeMessage} 
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
          >
            <Save className="h-4 w-4" /> 
            Save Welcome Message
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
