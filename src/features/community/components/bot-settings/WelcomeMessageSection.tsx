
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BotSettings } from "@/features/community/hooks/useBotSettings";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: {
    mutate: (settings: Partial<BotSettings>) => void;
  };
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  return (
    <AccordionItem value="welcome">
      <AccordionTrigger>Welcome Message</AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="welcome_message">Welcome Message</Label>
          <Textarea
            id="welcome_message"
            value={settings.welcome_message}
            onChange={(e) => updateSettings.mutate({ welcome_message: e.target.value })}
            placeholder="Enter the welcome message for new members"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bot_signature">Bot Signature</Label>
          <Input
            id="bot_signature"
            value={settings.bot_signature}
            onChange={(e) => updateSettings.mutate({ bot_signature: e.target.value })}
            placeholder="Enter the bot signature (e.g., Your Community Name Bot)"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
