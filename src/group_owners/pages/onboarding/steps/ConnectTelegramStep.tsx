import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ConnectTelegramStep = ({ onComplete, activeStep }: { onComplete: () => void, activeStep: boolean }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasTelegram, setHasTelegram] = useState(false);
  
  // Generate or fetch the verification code
  useEffect(() => {
    if (!user) return;
    
    const fetchOrGenerateCode = async () => {
      setIsLoading(true);
      try {
        // Check if user already has a code
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('current_telegram_code')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch verification code. Please try again.',
            variant: 'destructive'
          });
          return;
        }
        
        // If code exists, use it
        if (profile.current_telegram_code) {
          setVerificationCode(profile.current_telegram_code);
        } else {
          // Generate new code
          const newCode = `MBF_${generateRandomCode(7)}`;
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ current_telegram_code: newCode })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error updating profile with new code:', updateError);
            toast({
              title: 'Error',
              description: 'Failed to generate verification code. Please try again.',
              variant: 'destructive'
            });
            return;
          }
          
          setVerificationCode(newCode);
        }
        
        // Check if already verified
        await checkVerificationStatus();
      } catch (err) {
        console.error('Error:', err);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrGenerateCode();
  }, [user]);
  
  const generateRandomCode = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const copyToClipboard = () => {
    if (!verificationCode) return;
    
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Verification code copied to clipboard.',
    });
    
    setTimeout(() => setCopied(false), 3000);
  };
  
  const checkVerificationStatus = async () => {
    if (!user || !verificationCode) return;
    
    try {
      // Call the edge function to check verification status
      const { data, error } = await supabase.functions.invoke('check-verification-status', {
        body: {
          userId: user.id,
          verificationCode: verificationCode
        }
      });
      
      if (error) {
        console.error('Error checking verification status:', error);
        return false;
      }
      
      console.log('Verification status response:', data);
      
      if (data?.verified) {
        setIsVerified(true);
        setHasTelegram(true);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in verification check:', err);
      return false;
    }
  };
  
  const verifyConnection = async () => {
    if (!user || !verificationCode) return;
    
    setIsVerifying(true);
    setAttemptCount(prev => prev + 1);
    
    try {
      // Check verification status through dedicated function
      const isVerified = await checkVerificationStatus();
      
      if (isVerified) {
        toast({
          title: 'Success!',
          description: 'Telegram channel connected successfully.',
        });
        
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // If not verified, and this is not the first attempt, show warning
        if (attemptCount > 0) {
          toast({
            title: 'Verification pending',
            description: 'Make sure you\'ve added the bot as an admin and posted the code in the channel.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Checking verification',
            description: 'Verifying your Telegram channel connection...',
          });
          
          // Try again after delay (webhook might need time to process)
          setTimeout(checkVerificationStatus, 5000);
        }
      }
    } catch (err) {
      console.error('Error during verification:', err);
      toast({
        title: 'Error',
        description: 'Failed to verify connection. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // If already verified, move to next step
  useEffect(() => {
    if (isVerified && activeStep) {
      onComplete();
    }
  }, [isVerified, activeStep]);
  
  return (
    <div className="space-y-6 py-6">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl">Connect Your Telegram Channel</CardTitle>
        <CardDescription>
          Link your Telegram channel or group to enable subscription management
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="pt-6 pb-4">
          {isVerified ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium text-center">Telegram Channel Connected!</h3>
              <p className="text-center text-muted-foreground">
                Your Telegram channel has been successfully connected.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-medium mb-1">1. Add our bot to your Telegram channel</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Invite <span className="font-medium">@MembifyBot</span> and make it an admin with post messages permission
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-1">2. Post verification code in your channel</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Copy and post this exact code as a message in your channel:
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <div className="bg-secondary p-3 rounded-md flex-1 font-mono text-sm overflow-x-auto">
                      {isLoading ? "Loading..." : verificationCode}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyToClipboard}
                      disabled={isLoading || !verificationCode}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-1">3. Verify connection</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    After posting the code, click the verify button below
                  </p>
                  
                  {attemptCount > 1 && (
                    <Alert className="mt-3 mb-2">
                      <AlertTitle>Verification Tips</AlertTitle>
                      <AlertDescription className="text-sm">
                        Make sure:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>The bot is added as an admin with post permission</li>
                          <li>You posted the exact verification code</li>
                          <li>The verification code was posted as a regular message in the channel</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          {isVerified ? (
            <Button 
              onClick={onComplete} 
              className="w-full"
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={verifyConnection} 
              className="w-full"
              disabled={isLoading || isVerifying || !verificationCode}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : attemptCount > 0 ? (
                'Verify Again'
              ) : (
                'Verify Connection'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConnectTelegramStep;
