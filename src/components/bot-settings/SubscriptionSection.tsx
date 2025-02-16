
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

interface SubscriptionSectionProps {
  settings: BotSettings;
  updateSettings: any; // Using any here as the mutation type is complex
}

export const SubscriptionSection = ({ settings, updateSettings }: SubscriptionSectionProps) => {
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
              Configure how the bot handles subscriptions and reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Days before expiration to send reminder</Label>
              <Input
                type="number"
                value={settings.subscription_reminder_days}
                onChange={(e) =>
                  updateSettings.mutate({
                    subscription_reminder_days: parseInt(e.target.value),
                  })
                }
                className="max-w-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Reminder Message</Label>
              <Textarea
                value={settings.subscription_reminder_message}
                onChange={(e) =>
                  updateSettings.mutate({
                    subscription_reminder_message: e.target.value,
                  })
                }
                placeholder="Enter subscription reminder message..."
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.auto_remove_expired}
                  onCheckedChange={(checked) =>
                    updateSettings.mutate({ auto_remove_expired: checked })
                  }
                />
                <Label>Automatically remove expired members</Label>
              </div>
              <Textarea
                value={settings.expired_subscription_message}
                onChange={(e) =>
                  updateSettings.mutate({
                    expired_subscription_message: e.target.value,
                  })
                }
                placeholder="Message to send when subscription expires..."
              />
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
