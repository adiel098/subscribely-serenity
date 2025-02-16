import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/hooks/useBotSettings";
import { 
  Bot, Settings, MessageSquare, Clock, Bell, 
  Ban, Percent, Languages, Volume2, Moon, Eye 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

const MessagePreview = ({ message, signature }: { message: string; signature: string }) => {
  return (
    <div className="fixed right-4 top-24 w-80">
      <div className="rounded-lg border bg-card text-card-foreground">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Message Preview</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="rounded-lg bg-white/10 backdrop-blur-lg border p-4 space-y-2 font-[system-ui]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm text-primary">Bot</div>
                <div className="text-sm whitespace-pre-wrap">
                  {message}
                  {signature && (
                    <>
                      {"\n\n"}
                      <span className="text-muted-foreground">{signature}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotSettings = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { settings, isLoading, updateSettings } = useBotSettings(selectedCommunityId || "");
  const [expandedSection, setExpandedSection] = useState<string | null>("welcome");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No bot settings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center space-x-2">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Bot Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize your bot's behavior and automated messages
          </p>
        </div>
      </div>

      <MessagePreview 
        message={expandedSection === "welcome" ? settings.welcome_message : settings.subscription_reminder_message}
        signature={settings.bot_signature}
      />

      <Accordion
        type="single"
        collapsible
        value={expandedSection || undefined}
        onValueChange={(value) => setExpandedSection(value)}
        className="space-y-4"
      >
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
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.auto_welcome_message}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({ auto_welcome_message: checked })
                    }
                  />
                  <Label>Send automatic welcome message</Label>
                </div>
                <Textarea
                  value={settings.welcome_message}
                  onChange={(e) =>
                    updateSettings.mutate({ welcome_message: e.target.value })
                  }
                  placeholder="Enter your welcome message..."
                  className="min-h-[100px]"
                />
                <Input
                  value={settings.bot_signature}
                  onChange={(e) =>
                    updateSettings.mutate({ bot_signature: e.target.value })
                  }
                  placeholder="Bot signature (e.g. 🤖)"
                  className="max-w-[200px]"
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

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

        <AccordionItem value="renewal" className="border rounded-lg">
          <AccordionTrigger className="px-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-5 w-5 text-primary" />
              <span>Renewal Discounts</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Renewal Discount Settings</CardTitle>
                <CardDescription>
                  Configure discount offers for subscription renewals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.renewal_discount_enabled}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({ renewal_discount_enabled: checked })
                    }
                  />
                  <Label>Enable renewal discounts</Label>
                </div>
                <div className="space-y-2">
                  <Label>Discount Percentage</Label>
                  <Input
                    type="number"
                    value={settings.renewal_discount_percentage}
                    onChange={(e) =>
                      updateSettings.mutate({
                        renewal_discount_percentage: parseInt(e.target.value),
                      })
                    }
                    className="max-w-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="limits" className="border rounded-lg">
          <AccordionTrigger className="px-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <span>Message Limits</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Limit Settings</CardTitle>
                <CardDescription>
                  Set limits on message frequency and quiet hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Maximum messages per day</Label>
                  <Input
                    type="number"
                    value={settings.max_messages_per_day || ""}
                    onChange={(e) =>
                      updateSettings.mutate({
                        max_messages_per_day: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="No limit"
                    className="max-w-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quiet Hours Start</Label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_start || ""}
                      onChange={(e) =>
                        updateSettings.mutate({
                          quiet_hours_start: e.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet Hours End</Label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_end || ""}
                      onChange={(e) =>
                        updateSettings.mutate({
                          quiet_hours_end: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BotSettings;
