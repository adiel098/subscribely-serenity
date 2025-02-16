
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
  const [verificationCode, setVerificationCode] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeVerificationCode();
    }
  }, [user]);

  const initializeVerificationCode = async () => {
    try {
      // First, check if user already has a verification code
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('initial_telegram_code, current_telegram_code')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profile.current_telegram_code) {
        // User already has a current code, use it
        setVerificationCode(profile.current_telegram_code);
      } else if (profile.initial_telegram_code) {
        // User has an initial code but no current code, set initial as current
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ current_telegram_code: profile.initial_telegram_code })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Error updating current code:', updateError);
          return;
        }

        setVerificationCode(profile.initial_telegram_code);
      } else {
        // User has no codes, generate initial code
        const newCode = 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            initial_telegram_code: newCode,
            current_telegram_code: newCode
          })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Error setting initial code:', updateError);
          return;
        }

        setVerificationCode(newCode);
      }
    } catch (error) {
      console.error('Error in initializeVerificationCode:', error);
    }
  };

  const generateNewVerificationCode = async () => {
    if (!user) return;

    const newCode = 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_telegram_code: newCode })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating verification code:', updateError);
      toast({
        title: "Error",
        description: "Failed to generate new verification code",
        variant: "destructive",
      });
      return;
    }

    setVerificationCode(newCode);
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

  const verifyConnection = async () => {
    try {
      if (!user || !verificationCode) return;
      
      setIsVerifying(true);

      // First check if there's an existing verified bot settings with this code
      const { data: existingSettings, error: existingError } = await supabase
        .from('telegram_bot_settings')
        .select('verified_at, chat_id, community_id')
        .eq('verification_code', verificationCode)
        .not('verified_at', 'is', null)
        .single();

      console.log('Checking existing verified settings:', existingSettings);

      if (existingError) {
        console.log('No existing verified settings found, creating new...');
        
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

        if (communityError) {
          console.error('Community creation error:', communityError);
          throw communityError;
        }

        console.log('Community created:', community);

        // Set up bot settings
        const { data: botSettings, error: settingsError } = await supabase
          .from('telegram_bot_settings')
          .insert({
            community_id: community.id,
            verification_code: verificationCode,
          })
          .select()
          .single();

        if (settingsError) {
          console.error('Bot settings error:', settingsError);
          throw settingsError;
        }

        console.log('Bot settings created:', botSettings);

        // Check if the group has been verified - retry a few times with delay
        let verifiedSettings = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          const { data: settings, error: verificationError } = await supabase
            .from('telegram_bot_settings')
            .select('verified_at, chat_id')
            .eq('community_id', community.id)
            .single();

          if (verificationError) {
            console.error('Verification check error:', verificationError);
            throw verificationError;
          }

          console.log('Verification check attempt', attempts + 1, ':', settings);

          if (settings.verified_at && settings.chat_id) {
            verifiedSettings = settings;
            break;
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
          }
        }

        if (verifiedSettings) {
          // Generate new verification code for future use
          await generateNewVerificationCode();
          
          toast({
            title: "Success!",
            description: "Your Telegram group has been successfully connected!",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Not Verified",
            description: "Please make sure you've added the bot and sent the verification code in your group.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Found existing verified settings:', existingSettings);

        // Update community ownership
        const { data: communityUpdate, error: updateError } = await supabase
          .from('communities')
          .update({ owner_id: user.id })
          .eq('id', existingSettings.community_id)
          .select()
          .single();

        if (updateError) {
          console.error('Community update error:', updateError);
          throw updateError;
        }

        console.log('Community ownership updated:', communityUpdate);

        // Generate new verification code for future use
        await generateNewVerificationCode();

        toast({
          title: "Success!",
          description: "Your Telegram group has been successfully connected!",
        });
        navigate('/dashboard');
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

