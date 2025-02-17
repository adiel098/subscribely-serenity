
import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBroadcast } from "@/features/community/hooks/useBroadcast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface BroadcastSectionProps {
  communityId: string;
}

export const BroadcastSection = ({ communityId }: BroadcastSectionProps) => {
  const broadcast = useBroadcast(communityId);
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "expired">("all");
  const [includeButton, setIncludeButton] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const handleSend = () => {
    broadcast.mutate({
      message,
      filterType,
      includeButton,
      buttonText,
      buttonUrl,
    });
  };

  return (
    <AccordionItem value="broadcast">
      <AccordionTrigger>Broadcast Message</AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your broadcast message"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Send to</Label>
          <RadioGroup value={filterType} onValueChange={(value: "all" | "active" | "expired") => setFilterType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All Members</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active">Active Subscribers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expired" id="expired" />
              <Label htmlFor="expired">Expired Subscribers</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-button"
              checked={includeButton}
              onCheckedChange={(checked) => setIncludeButton(checked as boolean)}
            />
            <Label htmlFor="include-button">Include Button</Label>
          </div>

          {includeButton && (
            <div className="space-y-2 pl-6">
              <div className="space-y-2">
                <Label htmlFor="button-text">Button Text</Label>
                <Input
                  id="button-text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Enter button text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button-url">Button URL</Label>
                <Input
                  id="button-url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="Enter button URL"
                />
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSend} 
          className="w-full" 
          disabled={!message || broadcast.isLoading}
        >
          {broadcast.isLoading ? "Sending..." : "Send Broadcast"}
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
};
