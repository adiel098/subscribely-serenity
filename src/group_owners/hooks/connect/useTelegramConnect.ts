
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";

export function useTelegramConnect() {
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

  const generateNewCode = () => {
    return 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const verifyConnection = async () => {
    try {
      if (!user || !verificationCode) return;
      
      setIsVerifying(true);

      // Explicitly specify which foreign key to use
      const { data: botSettings, error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .select(`
          verified_at,
          chat_id,
          community_id,
          communities!telegram_bot_settings_community_id_fkey(
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
