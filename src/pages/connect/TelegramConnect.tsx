import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TelegramConnect = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const generateVerificationCode = () => {
    const code = 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return code;
  };

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

  const handleCommunitySetup = async () => {
    try {
      if (!user) return;
      
      setIsCreating(true);
      const code = generateVerificationCode();

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

      const { error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .insert({
          community_id: community.id,
          verification_code: code,
        });

      if (settingsError) throw settingsError;

      setVerificationCode(code);
      toast({
        title: "Success!",
        description: "Your community has been created. Please follow the verification steps.",
      });

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
                <h3 className="text-lg font-medium text-gray-900">Get Verification Code</h3>
                <p className="mt-1 text-gray-500">
                  Click below to create your community and get a verification code
                </p>
                <Button 
                  className="mt-4"
                  onClick={handleCommunitySetup}
                  disabled={isCreating || !!verificationCode}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Community"}
                </Button>
              </div>
            </div>

            {verificationCode && (
              <>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Verify Your Group</h3>
                    <p className="mt-1 text-gray-500">
                      Copy and paste this verification code in your Telegram group. Our bot will verify it automatically.
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
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TelegramConnect;
