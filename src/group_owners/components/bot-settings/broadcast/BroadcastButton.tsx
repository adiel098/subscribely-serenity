
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface BroadcastButtonProps {
  handleSendBroadcast: () => Promise<void>;
  isSending: boolean;
  isDisabled: boolean;
}

export const BroadcastButton = ({
  handleSendBroadcast,
  isSending,
  isDisabled,
}: BroadcastButtonProps) => {
  return (
    <Button 
      onClick={handleSendBroadcast} 
      disabled={isDisabled || isSending}
      className={cn(
        "w-full transition-all", 
        isSending ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary/90"
      )}
    >
      <Send className={cn("h-4 w-4 mr-2", isSending && "animate-pulse")} />
      {isSending ? "Sending Broadcast..." : "Send Broadcast Message"}
    </Button>
  );
};
