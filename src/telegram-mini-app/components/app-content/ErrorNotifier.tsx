
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ErrorNotifierProps {
  errorState: string | null;
}

export const ErrorNotifier: React.FC<ErrorNotifierProps> = ({ errorState }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (errorState) {
      console.error('❌ FLOW: Error state detected:', errorState);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorState
      });
    }
  }, [errorState, toast]);

  return null; // This is a non-visual component
};
