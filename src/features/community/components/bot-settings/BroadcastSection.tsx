import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useBroadcast } from "@/hooks/community/useBroadcast";

interface BroadcastSectionProps {
  communityId: string;
}

export const BroadcastSection = ({ communityId }: BroadcastSectionProps) => {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { broadcast, isLoading, error, reset } = useBroadcast(communityId);

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      await broadcast(message);
      toast({
        title: "Success",
        description: "Broadcast message sent!",
      });
      setMessage("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send broadcast message.",
        variant: "destructive",
      });
    }
  };

  return (
    <AccordionItem value="broadcast">
      <AccordionTrigger>Broadcast Message</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Send a message to all subscribers of this community.
        </p>
        <div className="grid gap-2">
          <Label htmlFor="broadcast-message">Message</Label>
          <Textarea
            id="broadcast-message"
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || "Failed to send broadcast message."}
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={handleBroadcast} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Broadcast
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
};
