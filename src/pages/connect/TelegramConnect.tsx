
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TelegramConnect = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCommunitySetup = async () => {
    try {
      if (!user) return;
      
      setIsCreating(true);

      // Create a new community
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

      // Set up the bot settings for this community (without bot token)
      const { error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .insert({
          community_id: community.id,
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Success!",
        description: "Your community has been created. Now add our bot to your Telegram group as an admin.",
      });

      // Navigate to the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: "Failed to set up the community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
                <h3 className="text-lg font-medium text-gray-900">Add our bot to your group</h3>
                <p className="mt-1 text-gray-500">
                  Add @YourGlobalBotName to your Telegram group and make it an administrator
                </p>
                <a 
                  href="https://t.me/YourGlobalBotName" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                >
                  Open Bot
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Create your community</h3>
                <p className="mt-1 text-gray-500">
                  Click below to create your community and link it to your Telegram group
                </p>
                <Button 
                  className="mt-4"
                  onClick={handleCommunitySetup}
                  disabled={isCreating}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Community"}
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
