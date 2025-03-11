
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { FilterTypeSelector } from "./FilterTypeSelector";
import { useBroadcast } from "@/group_owners/hooks/useBroadcast";
import { toast } from "sonner";

interface BroadcastMessageFormProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastMessageForm = ({ 
  entityId, 
  entityType 
}: BroadcastMessageFormProps) => {
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired' | 'plan'>('all');
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const { sendBroadcastMessage } = useBroadcast();

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (filterType === 'plan' && !selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendBroadcastMessage({
        entityId,
        entityType,
        message,
        filterType,
        ...(filterType === 'plan' && { subscriptionPlanId: selectedPlanId })
      });

      if (result.success) {
        toast.success(`Message sent to ${result.sent_success} recipients`);
        setMessage("");
      } else {
        toast.error(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('An error occurred while sending the broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="filter-type">Select Recipients</Label>
        <FilterTypeSelector 
          value={filterType}
          onChange={setFilterType}
          entityId={entityId}
          entityType={entityType}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your broadcast message here..."
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {message.length}/1000 characters
        </p>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSendBroadcast} 
          disabled={isSending || !message.trim() || (filterType === 'plan' && !selectedPlanId)}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Broadcast
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
