import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, ArrowRight, Loader2, Bot, AlertCircle, ArrowLeft, Copy, CheckCircle, ShieldCheck, Send, PartyPopper } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
interface ConnectTelegramStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isTelegramConnected: boolean;
  saveCurrentStep: (step: string) => void;
}
export const ConnectTelegramStep: React.FC<ConnectTelegramStepProps> = ({
  goToNextStep,
  goToPreviousStep,
  isTelegramConnected,
  saveCurrentStep
}) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  useEffect(() => {
    if (user) {
      initializeVerificationCode();
    }
  }, [user]);
  const generateNewCode = () => {
    return 'MBF_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };
  const initializeVerificationCode = async () => {
    setIsLoading(true);
    try {
      const {
        data: profile,
        error: profileError
      } = await supabase.from('profiles').select('initial_telegram_code, current_telegram_code').eq('id', user?.id).single();
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
      if (profile.current_telegram_code) {
        setVerificationCode(profile.current_telegram_code);
      } else {
        const newCode = generateNewCode();
        const {
          error: updateError
        } = await supabase.from('profiles').update({
          initial_telegram_code: profile.initial_telegram_code || newCode,
          current_telegram_code: newCode
        }).eq('id', user?.id);
        if (updateError) {
          console.error('Error updating codes:', updateError);
          return;
        }
        setVerificationCode(newCode);
      }
    } catch (error) {
      console.error('Error in initializeVerificationCode:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copied Successfully!",
        description: "Verification code copied to clipboard",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };
  const verifyConnection = async () => {
    try {
      if (!user || !verificationCode) return;
      setIsVerifying(true);
      setVerificationAttempted(true);
      setVerificationStatus('idle');

      // Show processing toast to let user know verification is in progress
      toast({
        title: "🔄 Processing Verification",
        description: "Checking your Telegram connection...",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800"
      });
      const {
        data: botSettings,
        error: settingsError
      } = await supabase.from('telegram_bot_settings').select(`
          verified_at,
          chat_id,
          community_id,
          communities!telegram_bot_settings_community_id_fkey (
            name,
            telegram_chat_id,
            owner_id
          )
        `).eq('verification_code', verificationCode).not('verified_at', 'is', null).maybeSingle();
      if (settingsError) {
        console.error('Error checking bot settings:', settingsError);
        throw settingsError;
      }
      const {
        data: recentCommunity,
        error: communityError
      } = await supabase.from('communities').select('*').eq('owner_id', user.id).order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (communityError) {
        console.error('Error checking recent community:', communityError);
        throw communityError;
      }
      if (botSettings || recentCommunity && recentCommunity.telegram_chat_id) {
        // Success case
        const newCode = generateNewCode();
        const {
          error: updateError
        } = await supabase.from('profiles').update({
          current_telegram_code: newCode
        }).eq('id', user?.id);
        if (updateError) {
          console.error('Error updating verification code:', updateError);
        } else {
          setVerificationCode(newCode);
        }

        // Set success state
        setVerificationStatus('success');
        setShowSuccessDialog(true);
        saveCurrentStep('connect-telegram');

        // Show success toast
        toast({
          title: "🎉 Connection Successful!",
          description: "Your Telegram group has been successfully connected to Membify",
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
        });
      } else {
        // Failure case
        setVerificationStatus('error');

        // Show detailed error message with troubleshooting steps
        toast({
          title: "⚠️ Verification Failed",
          description: "Please check the following: 1) Bot is added as admin 2) Verification code was sent in the group 3) Wait a few seconds and try again",
          variant: "destructive",
          duration: 6000
        });
      }
    } catch (error) {
      // Technical error handling
      console.error('Verification error:', error);
      setVerificationStatus('error');
      toast({
        title: "❌ Technical Error",
        description: "There was a problem processing your request. Please try again or contact support.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsVerifying(false);
    }
  };
  const resetVerification = () => {
    setVerificationAttempted(false);
    setVerificationStatus('idle');
  };
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    goToNextStep();
  };
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  return <OnboardingLayout currentStep="connect-telegram" title="Connect Your Telegram Group" description="Link your Telegram group to enable membership management" icon={<MessageCircle size={24} />} onBack={goToPreviousStep} showBackButton={true}>
      {isLoading ? <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-indigo-600">Loading...</span>
        </div> : <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
          {isTelegramConnected ? <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        type: "spring",
        stiffness: 200,
        damping: 15
      }}>
              <Alert className="bg-green-50 border-green-200">
                <motion.div initial={{
            rotate: 0
          }} animate={{
            rotate: [0, 15, 0, -15, 0]
          }} transition={{
            delay: 0.4,
            duration: 0.6
          }}>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </motion.div>
                <AlertTitle className="text-green-800">Group Connected!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your Telegram group has been successfully connected to Membify.
                </AlertDescription>
              </Alert>
            </motion.div> : <motion.div variants={item}>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Connection Required</AlertTitle>
                <AlertDescription className="text-blue-700">
                  You need to connect at least one Telegram group to continue.
                </AlertDescription>
              </Alert>
            </motion.div>}

          {verificationAttempted && verificationStatus === 'error' && !isTelegramConnected && <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Verification Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Make sure the bot is added as an administrator to your group</li>
                    <li>Copy the code again and send it in your Telegram group</li>
                    <li>Wait a few seconds for Telegram to process your message</li>
                    
                  </ul>
                </AlertDescription>
              </Alert>
            </motion.div>}

          <motion.div variants={item}>
            <Card className="p-6 bg-white shadow-md border border-indigo-100 overflow-hidden">
              <div className="space-y-8">
                <motion.div className="flex gap-4" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.5,
              delay: 0.3
            }}>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-indigo-600" />
                      Add our bot to your group
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Add <a href="https://t.me/membifybot" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:text-indigo-800 underline decoration-2 decoration-indigo-300 underline-offset-2">
                        @MembifyBot
                      </a> to your Telegram group or channel and make it an administrator with these permissions:
                    </p>
                    <motion.ul className="mt-3 space-y-2" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  delay: 0.5
                }}>
                      <motion.li className="flex items-center text-gray-700" initial={{
                    x: -10,
                    opacity: 0
                  }} animate={{
                    x: 0,
                    opacity: 1
                  }} transition={{
                    delay: 0.6
                  }}>
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Delete messages</span>
                      </motion.li>
                      <motion.li className="flex items-center text-gray-700" initial={{
                    x: -10,
                    opacity: 0
                  }} animate={{
                    x: 0,
                    opacity: 1
                  }} transition={{
                    delay: 0.7
                  }}>
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Ban users</span>
                      </motion.li>
                      <motion.li className="flex items-center text-gray-700" initial={{
                    x: -10,
                    opacity: 0
                  }} animate={{
                    x: 0,
                    opacity: 1
                  }} transition={{
                    delay: 0.8
                  }}>
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Add new admins</span>
                      </motion.li>
                    </motion.ul>
                  </div>
                </motion.div>

                <motion.div className="flex gap-4" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }}>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Copy className="h-5 w-5 text-indigo-600" />
                      Copy Verification Code
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Copy this verification code and paste it in your Telegram group or channel
                    </p>
                    <motion.div className="mt-4 flex flex-col sm:flex-row items-center gap-3" initial={{
                  y: 10,
                  opacity: 0
                }} animate={{
                  y: 0,
                  opacity: 1
                }} transition={{
                  delay: 0.6
                }}>
                      <code className="px-6 py-3 bg-indigo-50 rounded-lg text-lg font-mono border border-indigo-100 text-indigo-700 w-full sm:w-auto text-center">
                        {verificationCode}
                      </code>
                      <Button onClick={() => copyToClipboard(verificationCode)} className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md w-full sm:w-auto">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                      </Button>
                    </motion.div>
                    <motion.p className="mt-3 text-sm text-gray-500 flex items-center" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  delay: 0.7
                }}>
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Note</span>
                      The message will be automatically deleted once verified
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
          
          <div className="pt-6 flex justify-between items-center">
            <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.8
        }} whileHover={{
          scale: 1.05,
          transition: {
            duration: 0.2
          }
        }}>
              <Button variant="outline" onClick={goToPreviousStep} className="gap-2">
                <ArrowLeft size={16} />
                Back
              </Button>
            </motion.div>
            
            {!isTelegramConnected && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.8
        }} whileHover={{
          scale: 1.05,
          transition: {
            duration: 0.2
          }
        }}>
                <Button className={`${verificationStatus === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'} text-white shadow-md`} onClick={verifyConnection} disabled={isVerifying}>
                  {isVerifying ? <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </> : verificationStatus === 'error' ? <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Try Again
                    </> : <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Verify Connection
                    </>}
                </Button>
              </motion.div>}
            
            {isTelegramConnected ? <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.6,
          type: "spring",
          stiffness: 200
        }} whileHover={{
          scale: 1.05,
          transition: {
            duration: 0.2
          }
        }}>
                <Button onClick={goToNextStep} size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  Continue to Platform Plan
                  <ArrowRight size={16} />
                </Button>
              </motion.div> : null}
          </div>
        </motion.div>}

      <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-4">
              <motion.div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg" initial={{
              scale: 0.5,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} transition={{
              duration: 0.5
            }}>
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <motion.div className="space-y-2" initial={{
              y: 20,
              opacity: 0
            }} animate={{
              y: 0,
              opacity: 1
            }} transition={{
              delay: 0.3,
              duration: 0.5
            }}>
                <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Successfully Connected! 🎉
                </h3>
                <p className="text-sm text-gray-600">
                  Your Telegram community is now connected to Membify 🤖 <br />
                  Click below to continue to the next step.
                </p>
                <motion.div className="pt-4" initial={{
                scale: 0.9,
                opacity: 0
              }} animate={{
                scale: 1,
                opacity: 1
              }} transition={{
                delay: 0.5,
                duration: 0.3
              }} whileHover={{
                scale: 1.05
              }}>
                  <Button onClick={handleCloseSuccessDialog} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500">
                    Continue to Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </OnboardingLayout>;
};