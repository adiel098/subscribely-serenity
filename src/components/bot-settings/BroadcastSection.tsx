
import { Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastSectionProps {
  communityId: string;
}

export const BroadcastSection = ({ communityId }: BroadcastSectionProps) => {
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from('broadcast_messages').insert({
        community_id: communityId,
        message: message.trim(),
        filter_type: filterType,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Broadcast message queued successfully");
      setMessage("");
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error("Failed to send broadcast message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AccordionItem value="broadcast" className="border rounded-lg">
      <AccordionTrigger className="px-4">
        <div className="flex items-center space-x-2">
          <Send className="h-5 w-5 text-primary" />
          <span>Broadcast Message</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>Send Broadcast Message</CardTitle>
            <CardDescription>
              Send a message to your community members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="active">Active Subscribers</SelectItem>
                  <SelectItem value="expired">Expired Subscribers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your broadcast message..."
              className="min-h-[150px]"
            />
            <Button 
              onClick={handleSendBroadcast} 
              disabled={isSending || !message.trim()}
              className="w-full"
            >
              {isSending ? "Sending..." : "Send Broadcast"}
            </Button>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
