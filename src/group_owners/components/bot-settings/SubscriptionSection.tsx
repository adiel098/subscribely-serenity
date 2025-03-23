
import { Bell, Save, Clock, Image, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";

interface SubscriptionSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const SubscriptionSection = ({ settings, updateSettings }: SubscriptionSectionProps) => {
  const [activeTab, setActiveTab] = useState("first-reminder");
  const [isFirstImageUploading, setIsFirstImageUploading] = useState(false);
  const [isSecondImageUploading, setIsSecondImageUploading] = useState(false);
  const [firstImageError, setFirstImageError] = useState<string | null>(null);
  const [secondImageError, setSecondImageError] = useState<string | null>(null);
  
  const [draftSettings, setDraftSettings] = useState({
    first_reminder_days: settings.first_reminder_days || 3,
    first_reminder_message: settings.first_reminder_message || 'Your subscription will expire soon. Renew now to maintain access!',
    first_reminder_image: settings.first_reminder_image || null,
    second_reminder_days: settings.second_reminder_days || 1,
    second_reminder_message: settings.second_reminder_message || 'Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!',
    second_reminder_image: settings.second_reminder_image || null,
    expired_subscription_message: settings.expired_subscription_message,
  });

  const handleSave = () => {
    updateSettings.mutate(draftSettings);
    toast.success("Subscription reminder settings saved successfully");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full mb-4 bg-gray-50">
          <TabsTrigger value="first-reminder" className="flex-1 flex items-center gap-1">
            <Bell className="h-3.5 w-3.5" />
            <span>First Reminder</span>
          </TabsTrigger>
          <TabsTrigger value="second-reminder" className="flex-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Final Reminder</span>
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex-1 flex items-center gap-1">
            <Send className="h-3.5 w-3.5" />
            <span>Expired</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="first-reminder" className="space-y-4 mt-0">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" />
              Days Before Expiration
            </Label>
            <Input
              type="number"
              value={draftSettings.first_reminder_days}
              onChange={(e) =>
                setDraftSettings(prev => ({
                  ...prev,
                  first_reminder_days: parseInt(e.target.value) || 0,
                }))
              }
              className="max-w-[100px] border-amber-200"
              min={1}
              max={30}
            />
            <p className="text-xs text-muted-foreground">
              Send this reminder {draftSettings.first_reminder_days} days before subscription expires
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Send className="h-4 w-4" />
              First Reminder Message
            </Label>
            <Textarea
              value={draftSettings.first_reminder_message}
              onChange={(e) =>
                setDraftSettings(prev => ({
                  ...prev,
                  first_reminder_message: e.target.value,
                }))
              }
              placeholder="Enter your first reminder message..."
              rows={3}
              className="resize-none border-amber-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Image className="h-4 w-4" />
              First Reminder Image
            </Label>
            <ImageUploadSection
              image={draftSettings.first_reminder_image}
              setImage={(image) => 
                setDraftSettings(prev => ({
                  ...prev,
                  first_reminder_image: image,
                }))
              }
              updateSettings={{ mutate: () => {} }}
              settingsKey="first_reminder_image"
              isUploading={isFirstImageUploading}
              setIsUploading={setIsFirstImageUploading}
              imageError={firstImageError}
              setImageError={setFirstImageError}
              label="First Reminder Image 🖼️"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="second-reminder" className="space-y-4 mt-0">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" />
              Days Before Expiration
            </Label>
            <Input
              type="number"
              value={draftSettings.second_reminder_days}
              onChange={(e) =>
                setDraftSettings(prev => ({
                  ...prev,
                  second_reminder_days: parseInt(e.target.value) || 0,
                }))
              }
              className="max-w-[100px] border-amber-200"
              min={0}
              max={15}
            />
            <p className="text-xs text-muted-foreground">
              Send this reminder {draftSettings.second_reminder_days} days before subscription expires
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Send className="h-4 w-4" />
              Final Reminder Message
            </Label>
            <Textarea
              value={draftSettings.second_reminder_message}
              onChange={(e) =>
                setDraftSettings(prev => ({
                  ...prev,
                  second_reminder_message: e.target.value,
                }))
              }
              placeholder="Enter your final reminder message..."
              rows={3}
              className="resize-none border-amber-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Image className="h-4 w-4" />
              Final Reminder Image
            </Label>
            <ImageUploadSection
              image={draftSettings.second_reminder_image}
              setImage={(image) => 
                setDraftSettings(prev => ({
                  ...prev,
                  second_reminder_image: image,
                }))
              }
              updateSettings={{ mutate: () => {} }}
              settingsKey="second_reminder_image"
              isUploading={isSecondImageUploading}
              setIsUploading={setIsSecondImageUploading}
              imageError={secondImageError}
              setImageError={setSecondImageError}
              label="Final Reminder Image 🖼️"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-4 mt-0">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-amber-700">
              <Send className="h-4 w-4" />
              Expiration Message
            </Label>
            <Textarea
              value={draftSettings.expired_subscription_message}
              onChange={(e) =>
                setDraftSettings(prev => ({
                  ...prev,
                  expired_subscription_message: e.target.value,
                }))
              }
              placeholder="Message to send when subscription expires..."
              rows={4}
              className="resize-none border-amber-200"
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent when a member's subscription expires.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <Button 
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-sm"
      >
        <Save className="w-4 h-4" />
        Save Reminder Settings
      </Button>
    </div>
  );
};
