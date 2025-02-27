
import { MessageSquare, Save, Image as ImageIcon, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { toast } from "sonner";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [draftMessage, setDraftMessage] = useState(settings.welcome_message);
  const [welcomeImage, setWelcomeImage] = useState(settings.welcome_image || "");

  const handleSave = () => {
    updateSettings.mutate({ 
      welcome_message: draftMessage,
      welcome_image: welcomeImage
    });
    toast.success("Welcome message saved successfully");
  };

  const handleImageSelect = () => {
    // Show a list of predefined images
    const images = [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // Beautiful landscape
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901", // Cute cat
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7", // Tech related
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04", // Living room
    ];
    
    // Use a simple prompt for selecting an image
    const selectedImageIndex = prompt(
      "Select an image (enter 1-4):\n1. Landscape\n2. Cat\n3. Technology\n4. Living Room"
    );
    
    if (selectedImageIndex && !isNaN(Number(selectedImageIndex))) {
      const index = Number(selectedImageIndex) - 1;
      if (index >= 0 && index < images.length) {
        setWelcomeImage(images[index]);
      }
    }
  };

  const clearImage = () => {
    setWelcomeImage("");
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
        <Card>
          <CardHeader>
            <CardTitle>Welcome Message Settings</CardTitle>
            <CardDescription>
              Customize the message new members receive when they join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {welcomeImage && (
              <div className="relative">
                <img
                  src={welcomeImage}
                  alt="Welcome"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-red-500 hover:bg-red-600"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleImageSelect}
              >
                <ImageIcon className="h-4 w-4" />
                {welcomeImage ? "Change Image" : "Add Image"}
              </Button>
            </div>
            <Textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Enter your welcome message..."
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Message
            </Button>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
