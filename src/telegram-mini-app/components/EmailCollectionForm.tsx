
import { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { collectUserEmail } from "@/telegram-mini-app/services/userProfileService";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

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
    
    // Validate telegram user ID - must be a numeric string
    if (!telegramUserId || !/^\d+$/.test(telegramUserId)) {
      console.error("Invalid Telegram user ID format:", telegramUserId);
      toast({
        variant: "destructive",
        title: "User identification error",
        description: "Invalid Telegram ID format. Please try reloading the app.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Saving email for telegram user:", telegramUserId, email);
      console.log("With additional data:", { firstName, lastName, communityId, username, photoUrl });
      
      // Pass all user details to the collectUserEmail function
      const success = await collectUserEmail(
        telegramUserId, 
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
      
      console.log("Email saved successfully for user:", telegramUserId);
      
      toast({
        title: "Email saved",
        description: "Thank you for providing your email",
      });
      
      // Trigger haptic feedback in Telegram if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
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

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)" },
    tap: { scale: 0.98 }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-up">
      <motion.div 
        className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-md border border-purple-100"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <div className="space-y-2 text-center">
          <motion.div 
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Mail className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.h1 
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-indigo-500 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Almost there! ✨
          </motion.h1>
          
          <motion.p 
            className="text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Please provide your email address to continue to the community
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email address</Label>
            <motion.div
              whileFocus="focus"
              whileTap="tap"
              variants={inputVariants}
            >
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </motion.div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </motion.div>
          
          <motion.p 
            className="text-xs text-center text-gray-500 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We'll only use your email to send important updates about your membership 📬
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};
