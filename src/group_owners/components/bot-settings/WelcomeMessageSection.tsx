
import { MessageSquare, Save, X, Upload } from "lucide-react";
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
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [draftMessage, setDraftMessage] = useState(settings.welcome_message || "");
  const [welcomeImage, setWelcomeImage] = useState<string>(settings.welcome_image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when settings change
  useEffect(() => {
    setDraftMessage(settings.welcome_message || "");
    setWelcomeImage(settings.welcome_image || "");
  }, [settings.welcome_message, settings.welcome_image]);

  const handleSave = () => {
    updateSettings.mutate({ 
      welcome_message: draftMessage,
      welcome_image: welcomeImage
    });
    
    console.log("Saving welcome settings:", {
      welcome_message: draftMessage,
      welcome_image: welcomeImage ? `${welcomeImage.substring(0, 30)}...` : null
    });
    
    toast.success("Welcome message saved successfully");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setWelcomeImage(result);
      
      // Save image immediately after upload
      updateSettings.mutate({ 
        welcome_image: result
      });
      
      console.log("Image uploaded:", result.substring(0, 30) + "...");
      toast.success("Welcome image uploaded");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setWelcomeImage("");
    updateSettings.mutate({ 
      welcome_image: null
    });
    toast.success("Welcome image removed");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                onClick={triggerFileInput}
              >
                <Upload className="h-4 w-4" />
                {welcomeImage ? "Change Image" : "Upload Image"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
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
