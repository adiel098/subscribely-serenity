import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface SubscriptionSectionProps {
  settings: any;
  updateSettings: (updates: any) => void;
}

export const SubscriptionSection = ({ settings, updateSettings }: SubscriptionSectionProps) => {
  const [isReminderEnabled, setIsReminderEnabled] = useState(settings.subscription_reminder_enabled);
  const [reminderMessage, setReminderMessage] = useState(settings.subscription_reminder_message);

  const handleReminderToggle = (value: boolean) => {
    setIsReminderEnabled(value);
    updateSettings({ subscription_reminder_enabled: value });
  };

  const handleReminderMessageChange = (value: string) => {
    setReminderMessage(value);
    updateSettings({ subscription_reminder_message: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Reminders</CardTitle>
        <CardDescription>
          Configure automated reminders for expiring subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder">Enable Reminders</Label>
          <Switch
            id="reminder"
            checked={isReminderEnabled}
            onCheckedChange={handleReminderToggle}
          />
        </div>
        <div>
          <Label htmlFor="message">Reminder Message</Label>
          <Textarea
            id="message"
            placeholder="Your subscription is expiring soon!"
            value={reminderMessage}
            onChange={(e) => handleReminderMessageChange(e.target.value)}
            disabled={!isReminderEnabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};
