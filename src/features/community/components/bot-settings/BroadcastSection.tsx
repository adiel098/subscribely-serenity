
import { useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/features/community/components/ui/textarea";
import { Button } from "@/features/community/components/ui/button";
import { Checkbox } from "@/features/community/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/community/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/features/community/components/ui/accordion";
import { useBroadcast } from "@/hooks/community/useBroadcast";
import { BroadcastStats } from "./BroadcastStats";

interface BroadcastSectionProps {
  communityId: string;
}

export const BroadcastSection = ({ communityId }: BroadcastSectionProps) => {
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<string>("all");
  const [silent, setSilent] = useState(false);
  const { toast } = useToast();
  const { broadcast, isLoading } = useBroadcast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      await broadcast({
        communityId,
        message: message.trim(),
        targetAudience,
        silent,
      });

      toast({
        title: "Success",
        description: "Message broadcast initiated",
      });

      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to broadcast message",
        variant: "destructive",
      });
    }
  };

  return (
    <AccordionItem value="broadcast">
      <AccordionTrigger>Broadcast Message</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          <BroadcastStats communityId={communityId} />

          <Card>
            <CardHeader>
              <CardTitle>New Broadcast</CardTitle>
              <CardDescription>
                Send a message to all or selected members of your community
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select
                    value={targetAudience}
                    onValueChange={setTargetAudience}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="active">Active Subscribers</SelectItem>
                      <SelectItem value="expired">Expired Subscribers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your broadcast message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="silent"
                    checked={silent}
                    onCheckedChange={(checked) => setSilent(checked as boolean)}
                  />
                  <label
                    htmlFor="silent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Silent notification (no sound)
                  </label>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="w-full sm:w-auto"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Broadcast"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
