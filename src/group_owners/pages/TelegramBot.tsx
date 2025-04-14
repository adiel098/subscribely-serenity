import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Bot, Check, AlertCircle, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useIsMobile } from "@/hooks/use-mobile";
import Loader from "@/components/Loader";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useTelegramBot } from "@/group_owners/hooks/useTelegramBot";
import { useUpdateTelegramBot } from "@/group_owners/hooks/useUpdateTelegramBot";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";

const TelegramBot = () => {
  const { selectedProjectId } = useProjectContext();
  const entityId = selectedProjectId;
  const isMobile = useIsMobile();
  
  const { settings: originalSettings, isLoading, updateSettings } = useBotSettings(entityId || undefined);
  
  const [useCustomBot, setUseCustomBot] = useState<boolean>(false);
  const [customBotToken, setCustomBotToken] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (originalSettings) {
      setUseCustomBot(originalSettings.use_custom_bot || false);
      // We don't show the token for security reasons, but we'll indicate if one is set
      setCustomBotToken(originalSettings.custom_bot_token ? '••••••••••••••••••••••••••••••' : '');
    }
  }, [originalSettings]);

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
      // First try to set the bot preference in the database
      const { data: prefData, error: prefError } = await supabase.rpc("set_bot_preference", {
        use_custom: true,
        custom_token: customBotToken
      });
      
      if (prefError) {
        throw new Error(prefError.message);
      }

      // Then validate the token
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken: customBotToken,
          communityId: entityId
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
    return <div className={`container ${isMobile ? 'px-3 py-4' : 'px-4 py-6'} max-w-7xl mx-auto`}>
      <PageHeader
        title="Telegram Bot Configuration"
        description="Configure your Telegram bot settings"
        icon={<MessageSquare className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />}
      />
      <Card className="animate-pulse">
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    </div>;
  }

  return (
    <div className={`container ${isMobile ? 'px-3 py-4' : 'px-4 py-6'} max-w-7xl mx-auto`}>
      <PageHeader
        title="Telegram Bot Configuration"
        description="Choose between Membify's bot or your own custom Telegram bot"
        icon={<MessageSquare className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />}
      />
      
      <div className="grid gap-4 md:gap-6">
        <Card className={!useCustomBot ? "border-indigo-200 bg-indigo-50/50 shadow-md" : ""}>
          <CardHeader className={isMobile ? "p-3 pb-2" : ""}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
              <div className={`bg-indigo-100 p-${isMobile ? '1.5' : '2'} rounded-full`}>
                <MessageSquare className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} text-indigo-600`} />
              </div>
              Membify Default Bot
            </CardTitle>
            <CardDescription className={isMobile ? "text-xs" : ""}>
              Use the official Membify bot to manage your community
            </CardDescription>
          </CardHeader>
          <CardContent className={`space-y-2 md:space-y-3 ${isMobile ? 'p-3 pt-0' : ''}`}>
            <div className="flex items-center gap-2">
              <Check className={`h-${isMobile ? '3.5' : '4'} w-${isMobile ? '3.5' : '4'} text-green-500`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>No setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`h-${isMobile ? '3.5' : '4'} w-${isMobile ? '3.5' : '4'} text-green-500`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Full access to all Membify features</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`h-${isMobile ? '3.5' : '4'} w-${isMobile ? '3.5' : '4'} text-green-500`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Automatic updates and maintenance</span>
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
                    <Label htmlFor="bot-token">
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
                        disabled={isValidating || !customBotToken || customBotToken.includes('•')}>
                        {isValidating ? "Validating..." : "Validate & Save"}
                      </Button>
                    </div>
                    
                    {validationSuccess === true && (
                      <div className="flex items-center gap-2 text-green-600 text-xs mt-2">
                        <Check className="h-3.5 w-3.5" />
                        <span>Bot token validated successfully!</span>
                      </div>
                    )}
                    
                    {validationSuccess === false && (
                      <div className="flex items-center gap-2 text-red-600 text-xs mt-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Invalid bot token. Please check and try again.</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`bg-amber-50 border border-amber-200 rounded-md p-${isMobile ? '2' : '3'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`h-${isMobile ? '3.5' : '4'} w-${isMobile ? '3.5' : '4'} text-amber-600 mt-0.5 shrink-0`} />
                      <div>
                        <p className="font-medium text-amber-800">Important:</p>
                        <p className="text-amber-700 mt-1">
                          Your custom bot must be an admin in your Telegram group/channel with permissions 
                          to add members, remove members, and send messages.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>How to create a bot:</p>
                    <ol className={`${isMobile ? 'text-xs' : 'text-sm'} space-y-1 md:space-y-2 pl-5 list-decimal`}>
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
