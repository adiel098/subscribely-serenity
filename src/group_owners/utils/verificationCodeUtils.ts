
import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a simple verification code with the MBF_ prefix
 */
export function generateVerificationCode(): string {
  return 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Fetches an existing verification code or generates a new one for the user
 */
export async function fetchOrGenerateVerificationCode(userId: string, toast: any): Promise<string | null> {
  try {
    console.log('Fetching or generating verification code for user:', userId);
    
    // Updated to use 'users' table instead of 'profiles'
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('initial_telegram_code, current_telegram_code')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user:', userError);
      toast({
        title: "Error",
        description: "Failed to fetch user information",
        variant: "destructive",
      });
      return null;
    }

    if (!user) {
      console.error('User not found:', userId);
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return null;
    }

    if (user.current_telegram_code) {
      console.log('Using existing code:', user.current_telegram_code);
      return user.current_telegram_code;
    } else {
      // Generate a new code
      const newCode = generateVerificationCode();
      console.log('Generated new code:', newCode);
      
      // Updated to use 'users' table
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          initial_telegram_code: user.initial_telegram_code || newCode,
          current_telegram_code: newCode
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating codes:', updateError);
        toast({
          title: "Error",
          description: "Failed to update verification code",
          variant: "destructive",
        });
        return null;
      }

      return newCode;
    }
  } catch (error) {
    console.error('Error in fetchOrGenerateVerificationCode:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return null;
  }
}
