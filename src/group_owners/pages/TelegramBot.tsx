
import { useState, useEffect } from "react";
import { Bot, Check, AlertCircle, Lock, ArrowRight } from "lucide-react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TelegramBot = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const communityIdToUse = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
  const { settings, isLoading, updateSettings } = useBotSettings(communityIdToUse);
  
  const [useCustomBot, setUseCustomBot] = useState<boolean>(false);
  const [customBotToken, setCustomBotToken] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (settings) {
      setUseCustomBot(settings.use_custom_bot || false);
      // We don't show the token for security reasons, but we'll indicate if one is set
      setCustomBotToken(settings.custom_bot_token ? '••••••••••••••••••••••••••••••' : '');
    }
  }, [settings]);

  const handleToggleCustomBot = (checked: boolean) => {
    setUseCustomBot(checked);
    if (!checked) {
      // When switching back to default bot, clear custom token and update settings
      updateSettings.mutate({
        use_custom_bot: false,
        custom_bot_token: null
      });
      toast.success("Switched to Membify's default bot");
    }
  };

  const validateBotToken = async () => {
    if (!customBotToken || customBotToken.includes('•')) {
      toast.error("Please enter a valid bot token");
      return;
    }

    setIsValidating(true);
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken: customBotToken,
          communityId: communityIdToUse
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        setValidationSuccess(true);
        updateSettings.mutate({
          use_custom_bot: true,
          custom_bot_token: customBotToken
        });
        toast.success("Bot token validated successfully! Your custom bot is now configured.");
      } else {
        setValidationSuccess(false);
        toast.error(`Invalid bot token: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error validating bot token:", error);
      setValidationSuccess(false);
      toast.error("Failed to validate bot token. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return <div className="container px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Telegram Bot Configuration"
        description="Configure your Telegram bot settings"
        icon={<Bot className="h-6 w-6" />}
      />
      <Card className="animate-pulse">
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    </div>;
  }

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Telegram Bot Configuration"
        description="Choose between Membify's bot or your own custom Telegram bot"
        icon={<Bot className="h-6 w-6" />}
      />
      
      <div className="grid gap-6">
        <Card className={!useCustomBot ? "border-indigo-200 bg-indigo-50/50 shadow-md" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-indigo-100 p-2 rounded-full">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              Membify Default Bot
            </CardTitle>
            <CardDescription>
              Use the official Membify bot to manage your community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">No setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Full access to all Membify features</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Automatic updates and maintenance</span>
            </div>
          </CardContent>
        </Card>

        <Card className={useCustomBot ? "border-indigo-200 bg-indigo-50/50 shadow-md" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-indigo-100 p-2 rounded-full">
                <Lock className="h-5 w-5 text-indigo-600" />
              </div>
              Custom Bot
            </CardTitle>
            <CardDescription>
              Use your own custom Telegram bot (requires setup)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Full brand customization</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Private message handling</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Your own bot username and avatar</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-bot-toggle" className="font-medium text-indigo-700">
                  Use Custom Bot
                </Label>
                <Switch 
                  id="custom-bot-toggle" 
                  checked={useCustomBot} 
                  onCheckedChange={handleToggleCustomBot}
                />
              </div>
              
              {useCustomBot && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-token" className="text-sm">
                      Bot Token <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="bot-token"
                        type="password"
                        value={customBotToken}
                        onChange={(e) => setCustomBotToken(e.target.value)}
                        placeholder="Enter your bot token from @BotFather"
                        className="flex-1"
                      />
                      <Button 
                        onClick={validateBotToken} 
                        disabled={isValidating || !customBotToken || customBotToken.includes('•')}
                        className="whitespace-nowrap"
                      >
                        {isValidating ? "Validating..." : "Validate & Save"}
                      </Button>
                    </div>
                    
                    {validationSuccess === true && (
                      <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                        <Check className="h-4 w-4" />
                        <span>Bot token validated successfully!</span>
                      </div>
                    )}
                    
                    {validationSuccess === false && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Invalid bot token. Please check and try again.</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Important:</p>
                        <p className="text-amber-700 mt-1">
                          Your custom bot must be an admin in your Telegram group/channel with permissions 
                          to add members, remove members, and send messages.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">How to create a bot:</p>
                    <ol className="text-sm space-y-2 pl-5 list-decimal">
                      <li>Open Telegram and search for @BotFather</li>
                      <li>Send /newbot command and follow the instructions</li>
                      <li>Copy the API token provided and paste it above</li>
                      <li>Make your bot an admin in your community</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramBot;
