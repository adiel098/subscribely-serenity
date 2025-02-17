import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/features/community/components/ui/button";
import { Input } from "@/features/community/components/ui/input";
import { Label } from "@/features/community/components/ui/label";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/features/community/components/ui/card";
import { useToast } from "@/features/community/components/ui/use-toast";

interface TelegramPaymentOptionProps {
  onSave: (config: { botToken: string; providerToken: string }) => Promise<void>;
  initialConfig?: {
    botToken: string;
    providerToken: string;
  };
}

export const TelegramPaymentOption = ({
  onSave,
  initialConfig,
}: TelegramPaymentOptionProps) => {
  const [botToken, setBotToken] = useState(initialConfig?.botToken || "");
  const [providerToken, setProviderToken] = useState(
    initialConfig?.providerToken || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ botToken, providerToken });
      toast({
        title: "Success",
        description: "Telegram payment settings saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving Telegram payment settings:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to save Telegram payment settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Telegram Payments
        </CardTitle>
        <CardDescription>
          Configure your Telegram bot for accepting payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bot-token">Bot Token</Label>
          <Input
            id="bot-token"
            placeholder="Enter your Telegram bot token"
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="provider-token">Provider Token</Label>
          <Input
            id="provider-token"
            placeholder="Enter your payment provider token"
            type="password"
            value={providerToken}
            onChange={(e) => setProviderToken(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};
