
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessagePreview } from "./MessagePreview";

export const WelcomeMessageSection = ({
  welcomeMessage,
  autoWelcomeMessage,
  onWelcomeMessageChange,
  onAutoWelcomeMessageChange
}: {
  welcomeMessage: string;
  autoWelcomeMessage: boolean;
  onWelcomeMessageChange: (value: string) => void;
  onAutoWelcomeMessageChange: (value: boolean) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-welcome"
          checked={autoWelcomeMessage}
          onCheckedChange={onAutoWelcomeMessageChange}
        />
        <Label htmlFor="auto-welcome">Send automatic welcome message</Label>
      </div>
      
      <Textarea
        value={welcomeMessage}
        onChange={(e) => onWelcomeMessageChange(e.target.value)}
        placeholder="Enter welcome message..."
        className="min-h-[100px]"
      />
      
      <MessagePreview message={welcomeMessage} />
    </div>
  );
};
