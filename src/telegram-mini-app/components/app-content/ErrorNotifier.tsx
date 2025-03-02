
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ErrorNotifierProps {
  errorState: string | null;
}

export const ErrorNotifier: React.FC<ErrorNotifierProps> = ({ errorState }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (errorState) {
      toast({
        variant: "destructive",
        title: "User Data Error",
        description: "There was a problem retrieving your information. Some features may be limited."
      });
    }
  }, [errorState, toast]);

  return null; // This is a non-visual component
};
