import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeMessageSectionProps {
  settings: any;
  updateSettings: (updates: any) => void;
}

export const WelcomeMessageSection = ({ settings, updateSettings }: WelcomeMessageSectionProps) => {
  const handleWelcomeMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSettings({ welcome_message: e.target.value });
  };

  const handleBotSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ bot_signature: e.target.value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Message</CardTitle>
        <CardDescription>
          Customize the welcome message sent to new members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
          <Textarea
            id="welcomeMessage"
            placeholder="Welcome to our community!"
            value={settings.welcome_message}
            onChange={handleWelcomeMessageChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="botSignature">Bot Signature</Label>
          <input
            type="text"
            id="botSignature"
            placeholder="- Your Bot Name"
            value={settings.bot_signature}
            onChange={handleBotSignatureChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </CardContent>
    </Card>
  );
};
