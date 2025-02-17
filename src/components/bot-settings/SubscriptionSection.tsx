
import { Bell, Save } from "lucide-react";
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
} from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BotSettings } from "@/hooks/useBotSettings";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const SubscriptionSection = ({ settings, updateSettings }: SubscriptionSectionProps) => {
  const [draftSettings, setDraftSettings] = useState({
    subscription_reminder_days: settings.subscription_reminder_days,
    subscription_reminder_message: settings.subscription_reminder_message,
    expired_subscription_message: settings.expired_subscription_message,
  });

  const handleSave = () => {
    updateSettings.mutate(draftSettings);
    toast.success("Subscription settings saved successfully");
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
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>
              Configure how the bot handles subscription expiration reminders. Members will be automatically removed when their subscription expires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Days before expiration to send reminder</Label>
              <Input
                type="number"
                value={draftSettings.subscription_reminder_days}
                onChange={(e) =>
                  setDraftSettings(prev => ({
                    ...prev,
                    subscription_reminder_days: parseInt(e.target.value),
                  }))
                }
                className="max-w-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Reminder Message</Label>
              <Textarea
                value={draftSettings.subscription_reminder_message}
                onChange={(e) =>
                  setDraftSettings(prev => ({
                    ...prev,
                    subscription_reminder_message: e.target.value,
                  }))
                }
                placeholder="Enter subscription reminder message..."
              />
            </div>
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
              />
            </div>
            <Button 
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
