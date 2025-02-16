
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TelegramConnect = () => {
  const [botToken, setBotToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBotSetup = async () => {
    try {
      if (!botToken || !user) return;
      
      setIsVerifying(true);

      // First create a new community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert({
          owner_id: user.id,
          platform: 'telegram',
          name: 'My Telegram Community', // You might want to make this configurable
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Then set up the bot settings
      const response = await fetch('/api/telegram-webhook/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId: community.id,
          token: botToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set up bot');
      }

      toast({
        title: "Success!",
        description: "Your Telegram bot has been successfully set up. Now add it to your group as an admin.",
      });

      // Navigate to the dashboard or next setup step
      navigate('/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: "Failed to set up the Telegram bot. Please try again.",
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
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Create your Telegram bot</h3>
                <p className="mt-1 text-gray-500">
                  First, create a new bot with @BotFather on Telegram and get your bot token
                </p>
                <a 
                  href="https://t.me/botfather" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                >
                  Open @BotFather
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Enter your bot token</h3>
                <p className="mt-1 text-gray-500">
                  Enter the token you received from @BotFather
                </p>
                <div className="mt-4">
                  <Input
                    type="text"
                    placeholder="Enter your bot token"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                </div>
                <Button 
                  className="mt-4"
                  onClick={handleBotSetup}
                  disabled={!botToken || isVerifying}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {isVerifying ? "Verifying..." : "Verify Bot Token"}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Add bot to your group</h3>
                <p className="mt-1 text-gray-500">
                  Add your bot to your Telegram group as an administrator
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  disabled={!botToken}
                >
                  Add Bot to Group
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
