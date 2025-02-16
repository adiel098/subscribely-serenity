import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TelegramConnect = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode] = useState<string>('MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase());
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Update the bot token when component mounts
    const updateBotToken = async () => {
      try {
        // First, get the existing settings record
        const { data: settings, error: fetchError } = await supabase
          .from('telegram_global_settings')
          .select('id')
          .limit(1)
          .single();

        if (fetchError) {
          console.error('Error fetching settings:', fetchError);
          toast({
            title: "Error",
            description: "Failed to fetch bot settings",
            variant: "destructive",
          });
          return;
        }

        // Now update using the correct UUID
        const { error: updateError } = await supabase
          .from('telegram_global_settings')
          .update({ 
            bot_token: '7925621863:AAGIRzj6xbM9CJERSld5xhF-maIO1JTA_LQ',
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (updateError) {
          console.error('Error updating bot token:', updateError);
          toast({
            title: "Error",
            description: "Failed to update bot token",
            variant: "destructive",
          });
          return;
        }

        console.log('Bot token updated successfully');
        
        // Now check the webhook using Supabase Functions
        const { data: webhookData, error: webhookError } = await supabase.functions
          .invoke('telegram-webhook', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            responseType: 'json'
          });

        if (webhookError) {
          console.error('Error checking webhook:', webhookError);
          toast({
            title: "Error",
            description: "Failed to check webhook status",
            variant: "destructive",
          });
          return;
        }

        console.log('Webhook check result:', webhookData);
        
        if (webhookData?.webhookInfo?.ok) {
          toast({
            title: "Success",
            description: "Telegram bot configuration updated successfully",
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    updateBotToken();
  }, [toast]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Verification code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const verifyConnection = async () => {
    try {
      if (!user) return;
      
      setIsVerifying(true);

      // Create community if it doesn't exist
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert({
          owner_id: user.id,
          platform: 'telegram',
          name: 'My Telegram Community',
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Set up bot settings
      const { data: botSettings, error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .insert({
          community_id: community.id,
          verification_code: verificationCode,
        })
        .select()
        .single();

      if (settingsError) throw settingsError;

      // Check if the group has been verified
      const { data: verifiedSettings, error: verificationError } = await supabase
        .from('telegram_bot_settings')
        .select('verified_at, chat_id')
        .eq('community_id', community.id)
        .single();

      if (verificationError) throw verificationError;

      if (verifiedSettings.verified_at && verifiedSettings.chat_id) {
        toast({
          title: "Success!",
          description: "Your Telegram group has been successfully connected!",
        });
      } else {
        toast({
          title: "Not Verified",
          description: "Please make sure you've added the bot and sent the verification code in your group.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify the connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connect Telegram Community</h1>
          <p className="mt-2 text-lg text-gray-600">
            Follow these steps to connect your Telegram community
          </p>
        </div>

        <Card className="p-6 bg-white shadow-sm">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Add our bot to your group</h3>
                <p className="mt-1 text-gray-500">
                  Add <a 
                    href="https://t.me/membifybot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    @MembifyBot
                  </a> to your Telegram group and make it an administrator with these permissions:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Delete messages</li>
                  <li>Ban users</li>
                  <li>Add new admins</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Copy Verification Code</h3>
                <p className="mt-1 text-gray-500">
                  Copy this verification code and paste it in your Telegram group
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <code className="px-4 py-2 bg-gray-100 rounded text-lg font-mono">
                    {verificationCode}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(verificationCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  The message will be automatically deleted once verified
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Verify Connection</h3>
                <p className="mt-1 text-gray-500">
                  After adding the bot and sending the verification code, click below to verify the connection
                </p>
                <Button 
                  className="mt-4"
                  onClick={verifyConnection}
                  disabled={isVerifying}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isVerifying ? "Verifying..." : "Verify Connection"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TelegramConnect;
