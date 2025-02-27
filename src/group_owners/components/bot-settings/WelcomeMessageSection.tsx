
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [draftMessage, setDraftMessage] = useState(settings.welcome_message || "");
  const [welcomeImage, setWelcomeImage] = useState<string>(settings.welcome_image || "");
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
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

    setIsUploading(true);
    setImageError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError("Please upload an image file (JPEG, PNG, etc.)");
      setIsUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // For additional reliability, create an image to verify the data loads
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully
        setWelcomeImage(result);
        
        // Save image immediately after upload
        updateSettings.mutate({ 
          welcome_image: result
        });
        
        console.log("Image uploaded:", result.substring(0, 30) + "...");
        toast.success("Welcome image uploaded");
        setIsUploading(false);
      };
      
      img.onerror = () => {
        setImageError("The selected file could not be loaded as an image");
        setIsUploading(false);
      };
      
      img.src = result;
    };
    
    reader.onerror = () => {
      setImageError("Error reading the image file");
      setIsUploading(false);
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
              Customize the message and image new members receive when they join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{imageError}</AlertDescription>
              </Alert>
            )}
            
            {welcomeImage && (
              <div className="relative">
                <img
                  src={welcomeImage}
                  alt="Welcome"
                  className="w-full h-48 object-cover rounded-md border"
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
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading 
                  ? "Uploading..." 
                  : welcomeImage 
                    ? "Change Image" 
                    : "Upload Image"
                }
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </div>
            
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
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
