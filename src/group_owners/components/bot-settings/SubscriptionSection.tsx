
import { Bell, Save, Clock, Image, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";
import { MessagePreview } from "./MessagePreview";

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
    <AccordionItem value="subscription" className="border rounded-lg">
      <AccordionTrigger className="px-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <span>Subscription Reminders</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Reminders</CardTitle>
            <CardDescription>
              Configure how the bot sends subscription expiration reminders. Members will be automatically reminded before their subscription expires.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="first-reminder" className="flex-1">First Reminder</TabsTrigger>
                <TabsTrigger value="second-reminder" className="flex-1">Final Reminder</TabsTrigger>
                <TabsTrigger value="expired" className="flex-1">Expired Message</TabsTrigger>
              </TabsList>
              
              <TabsContent value="first-reminder" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
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
                        className="max-w-[100px]"
                        min={1}
                        max={30}
                      />
                      <p className="text-xs text-muted-foreground">
                        Send this reminder {draftSettings.first_reminder_days} days before subscription expires
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
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
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        A "Renew Now!" button will be automatically added to this message.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
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
                        updateSettings={updateSettings}
                        settingsKey="first_reminder_image"
                        isUploading={isFirstImageUploading}
                        setIsUploading={setIsFirstImageUploading}
                        imageError={firstImageError}
                        setImageError={setFirstImageError}
                        label="First Reminder Image"
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">First Reminder Preview</h3>
                    <MessagePreview
                      message={draftSettings.first_reminder_message}
                      signature={settings.bot_signature}
                      image={draftSettings.first_reminder_image}
                      buttonText="Renew Now!"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="second-reminder" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
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
                        className="max-w-[100px]"
                        min={0}
                        max={15}
                      />
                      <p className="text-xs text-muted-foreground">
                        Send this reminder {draftSettings.second_reminder_days} days before subscription expires
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
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
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        A "Renew Now!" button will be automatically added to this message.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
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
                        updateSettings={updateSettings}
                        settingsKey="second_reminder_image"
                        isUploading={isSecondImageUploading}
                        setIsUploading={setIsSecondImageUploading}
                        imageError={secondImageError}
                        setImageError={setSecondImageError}
                        label="Final Reminder Image"
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Final Reminder Preview</h3>
                    <MessagePreview
                      message={draftSettings.second_reminder_message}
                      signature={settings.bot_signature}
                      image={draftSettings.second_reminder_image}
                      buttonText="Renew Now!"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="expired" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Expiration Message</Label>
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
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be sent when a member's subscription expires.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Expiration Message Preview</h3>
                    <MessagePreview
                      message={draftSettings.expired_subscription_message}
                      signature={settings.bot_signature}
                      buttonText="Renew Now!"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Reminder Settings
            </Button>
          </CardFooter>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
