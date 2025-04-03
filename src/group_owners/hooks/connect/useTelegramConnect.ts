import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";

export function useTelegramConnect() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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

  const initializeVerificationCode = async () => {
    if (!user?.id) return;
    
    const code = await fetchOrGenerateVerificationCode(user.id, toast);
    if (code) {
      setVerificationCode(code);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied Successfully!", {
        description: "Verification code copied to clipboard",
        duration: 5000,
      });
    } catch (err) {
      toast.error("Failed to copy to clipboard", {
        duration: 5000,
      });
    }
  };

  const generateNewCode = () => {
    return 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const verifyConnection = async () => {
    try {
      if (!user) {
        toast.warning("Authentication Required", {
          description: "Please log in to verify your channel connection.",
          duration: 5000,
        });
        return;
      }

      if (!verificationCode) {
        toast.warning("No Verification Code", {
          description: "Please wait while we generate your verification code...",
          duration: 5000,
        });
        await initializeVerificationCode();
        return;
      }
      
      setIsVerifying(true);

      // Check for a verified community with this code
      const { data: verifiedCommunity, error: verifiedError } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verifiedError) {
        if (verifiedError.code === 'PGRST116') {
          // No community found
          setIsVerifying(false);
          toast.warning("Channel Not Connected", {
            description: "Please add the bot as an admin and send the verification code in your channel.",
            action: {
              label: "To connect your channel:",
              onClick: () => {
                toast.message("Follow these steps:", {
                  description: React.createElement('ol', { className: 'list-decimal list-inside space-y-1 mt-2' },
                    React.createElement('li', null, [
                      'Add ',
                      React.createElement('code', { className: 'bg-gray-100 px-1 rounded' }, '@SubscribelyBot'),
                      ' as admin'
                    ]),
                    React.createElement('li', null, 'Send the verification code in your channel'),
                    React.createElement('li', null, 'Click \'Verify Connection\' again')
                  ),
                  duration: 10000,
                });
              }
            },
            duration: 10000,
          });
          return;
        }
        console.error('Error checking verified community:', verifiedError);
        throw verifiedError;
      }

      // אם החיבור הצליח (או דרך bot_settings או דרך הwebhook)
      if (verifiedCommunity?.telegram_chat_id) {
        // קודם מעדכנים את הסטטוס ומציגים הודעת הצלחה
        setShowSuccessDialog(true);
        setIsVerifying(false);
        toast.success("Channel Connected!", {
          description: "Your Telegram channel has been successfully connected.",
          duration: 5000,
        });

        // רק אחרי שהחיבור הצליח, מייצרים קוד חדש
        const newCode = generateNewCode();
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ current_telegram_code: newCode })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Error updating verification code:', updateError);
        } else {
          // מעדכנים את הקוד בממשק רק אחרי שהעדכון בדאטהבייס הצליח
          setVerificationCode(newCode);
        }

        // מרעננים את רשימת הקהילות
        refetch();
      } else {
        setIsVerifying(false);
        toast.warning("Channel Not Connected", {
          description: "Please add the bot as an admin and send the verification code in your Telegram channel.",
          action: {
            label: "To connect your channel:",
            onClick: () => {
              toast.message("Follow these steps:", {
                description: React.createElement('ol', { className: 'list-decimal list-inside space-y-1 mt-2' },
                  React.createElement('li', null, [
                    'Add ',
                    React.createElement('code', { className: 'bg-gray-100 px-1 rounded' }, '@SubscribelyBot'),
                    ' as admin'
                  ]),
                  React.createElement('li', null, 'Send the verification code in your channel'),
                  React.createElement('li', null, 'Click \'Verify Connection\' again')
                ),
                duration: 10000,
              });
            }
          },
          duration: 10000,
        });
      }
    } catch (error) {
      setIsVerifying(false);
      console.error('Verification error:', error);
      toast.error("Failed to verify the connection. Please try again.", {
        duration: 5000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    isVerifying,
    verificationCode,
    showSuccessDialog,
    setShowSuccessDialog,
    copyToClipboard,
    verifyConnection,
    goBack
  };
}
