
import { MessageSquare, Image, Save, UserPlus, Sparkles } from "lucide-react";
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
import { motion } from "framer-motion";

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
    <AccordionItem value="welcome" className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <AccordionTrigger className="px-4 py-4 hover:bg-indigo-50/50 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-2 rounded-full">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-left">
            <span className="font-medium">Welcome Message</span>
            <p className="text-xs text-muted-foreground">First greeting for new members</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-6 bg-gradient-to-b from-white to-indigo-50/20">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full shrink-0">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 flex items-center">
                    First Impressions Matter! <Sparkles className="h-3.5 w-3.5 ml-1 text-amber-500" />
                  </h3>
                  <p className="text-xs text-blue-700 mt-1">
                    A welcome message will be automatically sent to new members when they join. Make it friendly and informative to boost engagement! 👋
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message" className="text-indigo-700 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Welcome Message
            </Label>
            <Textarea
              id="welcome-message"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Welcome to our community! We're excited to have you join us..."
              className="min-h-[100px] border-indigo-200 focus:border-indigo-300 focus:ring-indigo-200"
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
            <p className="text-xs text-muted-foreground">
              Adding an image increases engagement by 80%! 📈
            </p>
          </div>

          <Button 
            onClick={handleSaveWelcomeMessage} 
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white w-full sm:w-auto shadow-sm"
          >
            <Save className="h-4 w-4" /> 
            Save Welcome Message
          </Button>
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  );
};
