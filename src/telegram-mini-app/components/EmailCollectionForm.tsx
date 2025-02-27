
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { collectUserEmail } from "@/telegram-mini-app/services/userService";

interface EmailCollectionFormProps {
  telegramUserId: string;
  onComplete: () => void;
}

export const EmailCollectionForm = ({ telegramUserId, onComplete }: EmailCollectionFormProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    
    setIsSubmitting(true);
    
    try {
      console.log("Saving email for telegram user:", telegramUserId, email);
      
      // Use the collectUserEmail function from userService
      const success = await collectUserEmail(telegramUserId, email);
      
      if (!success) {
        throw new Error("Failed to save email");
      }
      
      console.log("Email saved successfully for user:", telegramUserId);
      
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
