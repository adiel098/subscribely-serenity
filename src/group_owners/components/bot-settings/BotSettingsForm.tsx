
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotSettings } from "@/group_owners/hooks/types/subscription.types";
import { MessageInputSection } from "./welcome-message/MessageInputSection";
import { MessagePreview } from "./MessagePreview";

interface ExtendedBotSettings extends BotSettings {
  use_custom_bot?: boolean;
  custom_bot_token?: string | null;
  community_id?: string;
}

interface BotSettingsFormProps {
  settings: ExtendedBotSettings;
  isLoading: boolean;
  onSubmit: (settings: Partial<ExtendedBotSettings>) => void;
}

export const BotSettingsForm = ({
  settings,
  isLoading,
  onSubmit,
}: BotSettingsFormProps) => {
  const { toast } = useToast();
  
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [expiredMessage, setExpiredMessage] = useState<string>("");
  const [removedMessage, setRemovedMessage] = useState<string>("");
  const [reminderMessage, setReminderMessage] = useState<string>("");
  
  const [autoRemove, setAutoRemove] = useState(false);
  const [autoRemoveDays, setAutoRemoveDays] = useState(3);
  const [sendReminders, setSendReminders] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  
  useEffect(() => {
    if (settings) {
      setWelcomeMessage(settings.welcome_message || "");
      setExpiredMessage(settings.expired_message || "");
      setRemovedMessage(settings.removed_message || "");
      setReminderMessage(settings.reminder_message || "");
      
      setAutoRemove(settings.auto_remove_expired || false);
      setAutoRemoveDays(settings.auto_remove_days || 3);
      setSendReminders(settings.send_reminders || false);
      setReminderDays(settings.reminder_days || 3);
    }
  }, [settings]);

  const handleAutoRemoveToggle = (checked: boolean) => {
    setAutoRemove(checked);
    onSubmit({ auto_remove_expired: checked });
  };

  const handleSendRemindersToggle = (checked: boolean) => {
    setSendReminders(checked);
    onSubmit({ send_reminders: checked });
  };

  const handleSaveSettings = () => {
    onSubmit({
      welcome_message: welcomeMessage,
      expired_message: expiredMessage,
      removed_message: removedMessage,
      reminder_message: reminderMessage,
      auto_remove_expired: autoRemove,
      auto_remove_days: autoRemoveDays,
      send_reminders: sendReminders,
      reminder_days: reminderDays
    });

    toast({
      title: "Settings saved",
      description: "Your bot settings have been updated successfully."
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Bot Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="messages">
          <TabsList className="mb-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <MessageInputSection
                  draftMessage={welcomeMessage}
                  setDraftMessage={setWelcomeMessage}
                  updateSettings={onSubmit}
                  settingsKey="welcome_message"
                  label="Welcome Message"
                  placeholder="Enter the message that will be sent to users when they first join"
                />
              </div>
              <div>
                <MessagePreview message={welcomeMessage} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <MessageInputSection
                  draftMessage={expiredMessage}
                  setDraftMessage={setExpiredMessage}
                  updateSettings={onSubmit}
                  settingsKey="expired_message"
                  label="Expired Subscription Message"
                  placeholder="Enter the message that will be sent when a subscription expires"
                />
              </div>
              <div>
                <MessagePreview message={expiredMessage} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="behaviors" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-remove">Auto-Remove Expired Members</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically remove members when their subscription expires
                  </p>
                </div>
                <Switch
                  id="auto-remove"
                  checked={autoRemove}
                  onCheckedChange={handleAutoRemoveToggle}
                />
              </div>
              
              {autoRemove && (
                <div className="ml-6 border-l-2 border-indigo-100 pl-4 py-2">
                  <div className="space-y-1">
                    <Label htmlFor="auto-remove-days">Remove After (Days)</Label>
                    <input 
                      type="number" 
                      id="auto-remove-days"
                      min={0}
                      max={30}
                      value={autoRemoveDays}
                      onChange={(e) => {
                        const days = parseInt(e.target.value);
                        setAutoRemoveDays(days);
                        onSubmit({ auto_remove_days: days });
                      }}
                      className="w-20 rounded-md border border-input px-3 py-1 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days after expiration before removal
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="send-reminders">Subscription Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders before subscriptions expire
                  </p>
                </div>
                <Switch
                  id="send-reminders"
                  checked={sendReminders}
                  onCheckedChange={handleSendRemindersToggle}
                />
              </div>
              
              {sendReminders && (
                <div className="ml-6 border-l-2 border-indigo-100 pl-4 py-2">
                  <div className="space-y-1">
                    <Label htmlFor="reminder-days">Days Before Expiration</Label>
                    <input 
                      type="number" 
                      id="reminder-days"
                      min={1}
                      max={30}
                      value={reminderDays}
                      onChange={(e) => {
                        const days = parseInt(e.target.value);
                        setReminderDays(days);
                        onSubmit({ reminder_days: days });
                      }}
                      className="w-20 rounded-md border border-input px-3 py-1 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
