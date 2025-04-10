
import { MessageSquare, Image, Save, UserPlus, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BotSettings } from "@/group_owners/hooks/useBotSettings"; // Fixed import
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcome_message || '');
  const [welcomeImage, setWelcomeImage] = useState(settings.welcome_image);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Important: Update local state when settings change (like when community changes)
  useEffect(() => {
    setWelcomeMessage(settings.welcome_message || '');
    setWelcomeImage(settings.welcome_image);
  }, [settings]);

  console.log("Welcome Message Section - settings:", settings);
  console.log("Welcome Message from settings:", settings.welcome_message);
  console.log("Local welcome message state:", welcomeMessage);

  const handleSaveWelcomeMessage = () => {
    updateSettings.mutate({ 
      welcome_message: welcomeMessage,
      welcome_image: welcomeImage,
      auto_welcome_message: true // Always set to true as per requirement
    });
    toast.success("Welcome message saved successfully");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWelcomeMessage(e.target.value);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <Label htmlFor="welcome-message" className="text-indigo-700 flex items-center">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Welcome Message
        </Label>
        <Textarea
          id="welcome-message"
          value={welcomeMessage}
          onChange={handleTextChange}
          placeholder="Welcome to our community! We're excited to have you join us..."
          className="min-h-[208px] border-indigo-200 focus:border-indigo-300 focus:ring-indigo-200"
        />
        <p className="text-xs text-muted-foreground">
          Use friendly language and let members know what to expect! 📝
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center text-indigo-700">
          <Image className="h-4 w-4 mr-1.5" />
          Welcome Image (Optional)
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
          label="Upload Welcome Image 🖼️"
        />
      </div>

      <Button 
        onClick={handleSaveWelcomeMessage} 
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white w-full shadow-sm"
      >
        <Save className="h-4 w-4" /> 
        Save Welcome Message
      </Button>
    </div>
  );
};
