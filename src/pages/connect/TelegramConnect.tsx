
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Copy, CheckCircle, PartyPopper } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCommunities } from "@/hooks/useCommunities";

const TelegramConnect = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetch } = useCommunities();

  useEffect(() => {
    if (user) {
      initializeVerificationCode();
    }
  }, [user]);

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;
    if (showSuccessDialog) {
      redirectTimeout = setTimeout(async () => {
        await refetch();
        navigate('/dashboard', { state: { from: '/connect/telegram' } });
      }, 5000);
    }
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [showSuccessDialog, navigate, refetch]);

  const generateNewCode = () => {
    return 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const initializeVerificationCode = async () => {
    try {
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
        setVerificationCode(profile.current_telegram_code);
      } else {
        const newCode = generateNewCode();
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            initial_telegram_code: profile.initial_telegram_code || newCode,
            current_telegram_code: newCode
          })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Error updating codes:', updateError);
          return;
        }

        setVerificationCode(newCode);
      }
    } catch (error) {
      console.error('Error in initializeVerificationCode:', error);
    }
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

      // בדיקת חיבור קיים
      const { data: botSettings, error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .select(`
          verified_at,
          chat_id,
          community_id,
          communities:communities (
            name,
            telegram_chat_id,
            owner_id
          )
        `)
        .eq('verification_code', verificationCode)
        .not('verified_at', 'is', null)
        .maybeSingle();

      if (settingsError) {
        console.error('Error checking bot settings:', settingsError);
        throw settingsError;
      }

      // בדיקת קהילה שנוצרה דרך הווובהוק
      const { data: recentCommunity, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (communityError) {
        console.error('Error checking recent community:', communityError);
        throw communityError;
      }

      if (botSettings || (recentCommunity && recentCommunity.telegram_chat_id)) {
        const newCode = generateNewCode();
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ current_telegram_code: newCode })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Error updating verification code:', updateError);
        } else {
          setVerificationCode(newCode);
        }

        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Not Verified",
          description: "Please make sure you've added the bot as an admin and sent the verification code in your group.",
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
                  </a> to your Telegram group or channel and make it an administrator with these permissions:
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
                  Copy this verification code and paste it in your Telegram group or channel
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

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Successfully Connected! 🎉
                </h3>
                <p className="text-sm text-gray-500">
                  Your Telegram community is now connected to Membify 🤖 <br />
                  Redirecting to dashboard in 5 seconds... ⏱️
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelegramConnect;
