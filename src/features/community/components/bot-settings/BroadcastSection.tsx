import { useState } from "react";
import { useBroadcast } from "@/features/community/hooks/useBroadcast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSubscriptionPlans } from "@/features/community/hooks/useSubscriptionPlans";

export const BroadcastSection = ({ communityId }: { communityId: string }) => {
  const [message, setMessage] = useState("");
  const { mutate: broadcast } = useBroadcast(communityId);
  const { plans } = useSubscriptionPlans(communityId);

  const handleSend = () => {
    broadcast({ 
      message,
      filterType: 'all',
      includeButton: false
    });
  };

  return (
    <AccordionItem value="broadcast">
      <AccordionTrigger>Broadcast Message</AccordionTrigger>
      <AccordionContent>
        <form onSubmit={() => handleSend()} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your broadcast message"
            rows={4}
          />
          <Button type="submit" disabled={broadcast.isPending}>
            {broadcast.isPending ? "Sending..." : "Send Broadcast"}
          </Button>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
};
