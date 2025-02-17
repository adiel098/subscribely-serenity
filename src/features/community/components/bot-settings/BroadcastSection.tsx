import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBroadcastStats } from "@/hooks/useBroadcastStats";
import { BroadcastStats } from "./BroadcastStats";
import { Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const BroadcastSection = ({ communityId }: { communityId: string }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { data: stats, refetch } = useBroadcastStats(communityId);

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId,
          path: '/broadcast',
          message
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Broadcast message sent successfully",
      });
      setMessage("");
      await refetch();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        title: "Error",
        description: "Failed to send broadcast message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AccordionItem value="broadcast">
      <AccordionTrigger>Broadcast Message</AccordionTrigger>
      <AccordionContent>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Send a Broadcast Message</CardTitle>
            <CardDescription>
              Send a message to all members of your community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleSendBroadcast}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  Sending...
                  <Send className="h-4 w-4 ml-2 animate-spin" />
                </>
              ) : (
                <>
                  Send Broadcast
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <BroadcastStats stats={stats} />
      </AccordionContent>
    </AccordionItem>
  );
};
