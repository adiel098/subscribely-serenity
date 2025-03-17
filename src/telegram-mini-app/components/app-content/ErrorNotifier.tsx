
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

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

  // If there's an error, we also show it on screen for development purposes
  if (errorState) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-3 text-sm">
        <div className="flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>Error: {errorState}</span>
        </div>
        <div className="mt-1 text-xs opacity-80">
          Check the console logs for more details
        </div>
      </div>
    );
  }

  return null;
};
