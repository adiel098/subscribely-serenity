
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { BotSettings } from "@/features/community/hooks/useBotSettings";

interface SubscriptionSectionProps {
  settings: BotSettings;
  updateSettings: {
    mutate: (settings: Partial<BotSettings>) => void;
  };
}

export const SubscriptionSection = ({ settings, updateSettings }: SubscriptionSectionProps) => {
  return (
    <AccordionItem value="subscription">
      <AccordionTrigger>Subscription Settings</AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="subscription_reminder_days">Reminder Days Before Expiry</Label>
          <Input
            id="subscription_reminder_days"
            type="number"
            value={settings.subscription_reminder_days}
            onChange={(e) => updateSettings.mutate({ subscription_reminder_days: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription_reminder_message">Subscription Reminder Message</Label>
          <Textarea
            id="subscription_reminder_message"
            value={settings.subscription_reminder_message}
            onChange={(e) => updateSettings.mutate({ subscription_reminder_message: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expired_subscription_message">Expired Subscription Message</Label>
          <Textarea
            id="expired_subscription_message"
            value={settings.expired_subscription_message}
            onChange={(e) => updateSettings.mutate({ expired_subscription_message: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="auto_remove_expired">Auto Remove Expired Members</Label>
          <Switch
            id="auto_remove_expired"
            checked={settings.auto_remove_expired}
            onCheckedChange={(checked) => updateSettings.mutate({ auto_remove_expired: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="renewal_discount_enabled">Enable Renewal Discount</Label>
          <Switch
            id="renewal_discount_enabled"
            checked={settings.renewal_discount_enabled}
            onCheckedChange={(checked) => updateSettings.mutate({ renewal_discount_enabled: checked })}
          />
        </div>

        {settings.renewal_discount_enabled && (
          <div className="space-y-2">
            <Label htmlFor="renewal_discount_percentage">Renewal Discount Percentage</Label>
            <Input
              id="renewal_discount_percentage"
              type="number"
              min="0"
              max="100"
              value={settings.renewal_discount_percentage}
              onChange={(e) => updateSettings.mutate({ renewal_discount_percentage: parseInt(e.target.value) })}
            />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
