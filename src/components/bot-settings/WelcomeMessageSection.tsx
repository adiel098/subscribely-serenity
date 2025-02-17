import { MessageSquare, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
import { useBotSettings } from "@/hooks/community/useBotSettings";
import { useState } from "react";
import { toast } from "sonner";
import { BotSettings } from "@/types/bot-settings";

interface WelcomeMessageSectionProps {
  settings: BotSettings;
  updateSettings: any;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const [draftMessage, setDraftMessage] = useState(settings.welcome_message);

  const handleSave = () => {
    updateSettings.mutate({ welcome_message: draftMessage });
    toast.success("Welcome message saved successfully");
  };

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
            <Textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Enter your welcome message..."
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Message
            </Button>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
