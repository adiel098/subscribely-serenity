
import { MessageSquare } from "lucide-react";
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

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any; // Using any here as the mutation type is complex
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
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
  );
};
