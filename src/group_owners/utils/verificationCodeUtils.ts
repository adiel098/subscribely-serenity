
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const generateRandomCode = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const fetchOrGenerateVerificationCode = async (userId: string | undefined, toast: ReturnType<typeof useToast>['toast']) => {
  if (!userId) return null;
  
  try {
    // Check if user already has a code
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('current_telegram_code')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch verification code. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
    
    // If code exists, use it
    if (profile.current_telegram_code) {
      return profile.current_telegram_code;
    } else {
      // Generate new code
      const newCode = `MBF_${generateRandomCode(7)}`;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_telegram_code: newCode })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating profile with new code:', updateError);
        toast({
          title: 'Error',
          description: 'Failed to generate verification code. Please try again.',
          variant: 'destructive'
        });
        return null;
      }
      
      return newCode;
    }
  } catch (err) {
    console.error('Error:', err);
    toast({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      variant: 'destructive'
    });
    return null;
  }
};
