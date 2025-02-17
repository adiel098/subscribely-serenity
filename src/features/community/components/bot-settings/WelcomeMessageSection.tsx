
import { 
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessagePreview } from "./MessagePreview";

interface WelcomeMessageSectionProps {
  settings: {
    welcome_message: string;
    auto_welcome_message: boolean;
    bot_signature?: string;
  };
  updateSettings: {
    mutate: (newSettings: any) => void;
  };
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  return (
    <AccordionItem value="welcome">
      <AccordionTrigger>Welcome Message</AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-welcome"
            checked={settings.auto_welcome_message}
            onCheckedChange={(checked) => 
              updateSettings.mutate({ auto_welcome_message: checked })
            }
          />
          <Label htmlFor="auto-welcome">Send automatic welcome message</Label>
        </div>
        
        <Textarea
          value={settings.welcome_message}
          onChange={(e) => updateSettings.mutate({ welcome_message: e.target.value })}
          placeholder="Enter welcome message..."
          className="min-h-[100px]"
        />
        
        <MessagePreview 
          message={settings.welcome_message} 
          signature={settings.bot_signature}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
