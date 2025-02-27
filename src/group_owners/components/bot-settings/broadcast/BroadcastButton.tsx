
import { Button } from "@/components/ui/button";

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
      disabled={isDisabled}
      className="w-full"
    >
      {isSending ? "Sending..." : "Send Broadcast"}
    </Button>
  );
};
