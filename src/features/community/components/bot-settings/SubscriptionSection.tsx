import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessagePreview } from "./MessagePreview";
import { useBotSettings } from "@/hooks/community/useBotSettings";

interface SubscriptionSectionProps {
  settings: any;
  updateSettings: any;
}

export const SubscriptionSection = ({ settings, updateSettings }: SubscriptionSectionProps) => {
  const [subscriptionReminderMessage, setSubscriptionReminderMessage] = useState(settings.subscription_reminder_message);
  const [subscriptionReminderDays, setSubscriptionReminderDays] = useState(settings.subscription_reminder_days);

  const handleSaveSubscriptionSettings = async () => {
    await updateSettings.mutateAsync({
      subscription_reminder_message: subscriptionReminderMessage,
      subscription_reminder_days: subscriptionReminderDays,
    });
  };

  return (
    <AccordionItem value="subscription">
      <AccordionTrigger>Subscription Reminders</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="subscription-reminder-message">Reminder Message</Label>
          <Textarea
            id="subscription-reminder-message"
            placeholder="Your subscription is expiring soon!"
            value={subscriptionReminderMessage}
            onChange={(e) => setSubscriptionReminderMessage(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subscription-reminder-days">Reminder Days</Label>
          <Input
            type="number"
            id="subscription-reminder-days"
            placeholder="7"
            value={subscriptionReminderDays}
            onChange={(e) => setSubscriptionReminderDays(e.target.value)}
          />
        </div>
        <Button onClick={handleSaveSubscriptionSettings} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Subscription Settings"}
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
};
