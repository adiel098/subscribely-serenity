
import { useState, useEffect } from "react";
import { Mail, ArrowRight, Sparkles, Heart, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { collectUserEmail } from "@/telegram-mini-app/services/memberService";
import { useSearchParams } from "react-router-dom";

interface EmailCollectionFormProps {
  telegramUserId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  onComplete: () => void;
}

export const EmailCollectionForm = ({ 
  telegramUserId, 
  firstName, 
  lastName, 
  username,
  photoUrl,
  onComplete 
}: EmailCollectionFormProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get start parameter from URL which is the community ID
  const communityId = searchParams.get("start");
  
  // Validate Telegram ID on component mount
  useEffect(() => {
    if (!telegramUserId) {
      setIdError("No Telegram user ID provided");
      console.error("Missing Telegram user ID");
    } else if (!/^\d+$/.test(telegramUserId)) {
      setIdError(`Invalid Telegram ID format: ${telegramUserId}`);
      console.error("Invalid Telegram ID format:", telegramUserId);
    } else {
      setIdError(null);
      console.log("Valid Telegram user ID:", telegramUserId);
    }
  }, [telegramUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    // Validate Telegram ID format
    if (!telegramUserId || !/^\d+$/.test(telegramUserId)) {
      console.error("Invalid Telegram ID format:", telegramUserId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid user identification. Please reload the app.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Ensure telegramUserId is a string and trim any whitespace
      const cleanId = telegramUserId.toString().trim();
      
      console.log("Saving email for telegram user:", cleanId, email);
      console.log("With additional data:", { firstName, lastName, communityId, username, photoUrl });
      
      // Pass all user details to the collectUserEmail function
      const success = await collectUserEmail(
        cleanId, 
        email, 
        firstName, 
        lastName, 
        communityId || undefined,
        username,
        photoUrl
      );
      
      if (!success) {
        throw new Error("Failed to save email");
      }
      
      console.log("Email saved successfully for user:", cleanId);
      
      toast({
        title: "Email saved",
        description: "Thank you for providing your email",
      });
      
      // Call the onComplete callback to proceed to the community page
      onComplete();
    } catch (error) {
      console.error("Error saving email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your email. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md space-y-6 bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden transform transition-all hover:shadow-xl animate-slide-up">
        {/* Decorative header */}
        <div className="h-3 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"></div>
        
        <div className="px-8 pt-6 pb-3">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-75 animate-pulse"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-inner ring-2 ring-purple-100">
                <Mail className="h-8 w-8 text-purple-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-pink-400 text-white">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome! ✨
            </h1>
            <p className="text-gray-600 text-sm">
              Please provide your email address to continue to the community
            </p>
          </div>
        </div>

        {/* Display error if there's an ID validation issue */}
        {idError && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-600 font-medium">
                User identification error
              </p>
            </div>
            <p className="mt-1 text-xs text-red-500 pl-7">
              Please try reloading the app or contact support
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-500" />
              Email address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pr-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                disabled={!!idError || isSubmitting}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
                {email.length > 0 && email.includes('@') && <CheckCircle2 className="h-4 w-4" />}
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 rounded-md transition-all group shadow-md hover:shadow-lg"
            disabled={isSubmitting || !!idError}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Continue to Community
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            )}
          </Button>
          
          <div className="text-xs text-center text-gray-500 mt-6 flex flex-col items-center gap-2">
            <p className="flex items-center">
              <Heart className="h-3 w-3 text-pink-500 mr-1" />
              We'll only use your email to send important updates about your membership
            </p>
            
            <div className="pt-2 flex justify-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-purple-300"></span>
              <span className="inline-block h-1 w-1 rounded-full bg-pink-300"></span>
              <span className="inline-block h-1 w-1 rounded-full bg-purple-300"></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
