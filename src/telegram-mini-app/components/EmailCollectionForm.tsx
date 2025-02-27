
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get start parameter from URL which is the community ID
  const communityId = searchParams.get("start");

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
    
    // CRITICAL FIX: Validate Telegram ID format
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
      // Ensure telegramUserId is a string
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-up">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight">Welcome!</h1>
          <p className="text-gray-500 text-sm">
            Please provide your email address to continue to the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            We'll only use your email to send important updates about your membership
          </p>
        </form>
      </div>
    </div>
  );
};
