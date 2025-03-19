
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface TelegramVerificationFormProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  onVerify: () => void;
}

export const TelegramVerificationForm: React.FC<TelegramVerificationFormProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  onVerify
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

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

  return (
    <Card>
      <CardContent className="pt-6 pb-4">
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
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <Button 
          onClick={onVerify} 
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
      </CardFooter>
    </Card>
  );
};
