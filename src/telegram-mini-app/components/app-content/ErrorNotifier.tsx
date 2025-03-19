
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface ErrorNotifierProps {
  errorState: string | null;
}

export const ErrorNotifier: React.FC<ErrorNotifierProps> = ({ errorState }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (errorState) {
      console.error("🚨 ERROR NOTIFIER:", errorState);
      toast({
        variant: "destructive",
        title: "Application Error",
        description: errorState || "There was a problem loading the application. Please try again.",
        duration: 5000,
      });
    }
  }, [errorState, toast]);

  // If there's an error, we also show it on screen
  if (errorState) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-800 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-800 font-semibold flex items-center gap-2">
            Error Detected
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <p>{errorState}</p>
            <p className="mt-1 text-xs opacity-80">
              Please check the console logs for more details or try refreshing the page.
            </p>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return null;
};
