import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, 
  Copy, 
  CheckCircle, 
  PartyPopper, 
  ArrowLeft, 
  Bot, 
  ShieldCheck, 
  Send 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { motion } from "framer-motion";

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
        title: "✅ Copied Successfully!",
        description: "Verification code copied to clipboard",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800",
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

      // Fix: Don't use foreign key reference in the select, use a join instead
      const { data: botSettings, error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .select(`
          verified_at,
          chat_id,
          community_id,
          communities:communities(
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

      // Check for community created through webhook
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
          title: "⚠️ Not Verified",
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

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Removed the button from here (top of page) */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Connect Telegram Community 🚀
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to connect your Telegram community to our platform and start managing your members effortlessly ✨
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Added the back button here (inside the card) */}
          <Button 
            onClick={goBack} 
            variant="outline" 
            className="mb-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl overflow-hidden">
            <div className="space-y-10">
              {/* Step 1 */}
              <motion.div 
                className="flex flex-col md:flex-row gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex-shrink-0 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-600" />
                    Add our bot to your group
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Add <a 
                      href="https://t.me/membifybot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-medium hover:text-indigo-800 underline decoration-2 decoration-indigo-300 underline-offset-2"
                    >
                      @MembifyBot
                    </a> to your Telegram group or channel and make it an administrator with these permissions:
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-center text-gray-700">
                      <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Delete messages</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Ban users</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Add new admins</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                className="flex flex-col md:flex-row gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex-shrink-0 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Copy className="h-5 w-5 text-indigo-600" />
                    Copy Verification Code
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Copy this verification code and paste it in your Telegram group or channel
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                    <code className="px-6 py-3 bg-indigo-50 rounded-lg text-lg font-mono border border-indigo-100 text-indigo-700 w-full sm:w-auto text-center">
                      {verificationCode}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(verificationCode)}
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md w-full sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 flex items-center">
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Note</span>
                    The message will be automatically deleted once verified
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                className="flex flex-col md:flex-row gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex-shrink-0 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Send className="h-5 w-5 text-indigo-600" />
                    Verify Connection
                  </h3>
                  <p className="mt-2 text-gray-600">
                    After adding the bot and sending the verification code, click below to verify the connection
                  </p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                    onClick={verifyConnection}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Verify Connection
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-4">
              <motion.div 
                className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Successfully Connected! 🎉
                </h3>
                <p className="text-sm text-gray-600">
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
