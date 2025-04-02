import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/components/ui/use-toast";

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
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('initial_telegram_code, current_telegram_code')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      toast({
        title: "Error",
        description: "Failed to fetch profile information",
        variant: "destructive",
      });
      return null;
    }

    if (!profile) {
      console.error('Profile not found:', userId);
      toast({
        title: "Error",
        description: "Profile not found",
        variant: "destructive",
      });
      return null;
    }

    if (profile.current_telegram_code) {
      console.log('Using existing code:', profile.current_telegram_code);
      return profile.current_telegram_code;
    } else {
      // Generate a new code
      const newCode = generateVerificationCode();
      console.log('Generated new code:', newCode);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          initial_telegram_code: profile.initial_telegram_code || newCode,
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
