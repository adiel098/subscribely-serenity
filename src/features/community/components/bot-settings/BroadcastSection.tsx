import { useState } from "react";
import { useBroadcast } from "@/hooks/community/useBroadcast";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessagePreview } from "@/features/community/components/bot-settings/MessagePreview";
import { toast } from "sonner";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { BroadcastStatus } from "@/types";

interface BroadcastSectionProps {
  communityId: string;
}

export const BroadcastSection = ({ communityId }: BroadcastSectionProps) => {
  const [message, setMessage] = useState("");

  const broadcastMutation = useBroadcast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    broadcastMutation.mutate(message);
  };

  return (
    <AccordionItem value="broadcast">
      <AccordionTrigger>Broadcast Message</AccordionTrigger>
      <AccordionContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your broadcast message"
            rows={4}
          />
          <Button type="submit" disabled={broadcastMutation.isPending}>
            {broadcastMutation.isPending ? "Sending..." : "Send Broadcast"}
          </Button>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
};
