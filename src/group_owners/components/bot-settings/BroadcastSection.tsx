
import { Image, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useBroadcast } from "@/group_owners/hooks/useBroadcast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUploadSection } from "./welcome-message/ImageUploadSection";
import { Label } from "@/components/ui/label";

interface BroadcastSectionProps {
  communityId: string;
}

export const BroadcastSection = ({ communityId }: BroadcastSectionProps) => {
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "expired" | "plan">("all");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [includeButton, setIncludeButton] = useState(false);
  const [broadcastImage, setBroadcastImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const { mutateAsync: sendBroadcast } = useBroadcast(communityId);

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (filterType === 'plan' && !selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    setIsSending(true);
    try {
      await sendBroadcast({
        message: message.trim(),
        filterType,
        subscriptionPlanId: filterType === 'plan' ? selectedPlanId : undefined,
        includeButton,
        image: broadcastImage
      });

      setMessage("");
      setBroadcastImage(null);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error("Error sending broadcast messages");
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
                onValueChange={(value: "all" | "active" | "expired" | "plan") => {
                  setFilterType(value);
                  if (value !== 'plan') {
                    setSelectedPlanId("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="active">Active Subscribers</SelectItem>
                  <SelectItem value="expired">Expired Subscribers</SelectItem>
                  <SelectItem value="plan">Specific Plan</SelectItem>
                </SelectContent>
              </Select>

              {filterType === 'plan' && plans && (
                <Select
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your broadcast message..."
              className="min-h-[150px]"
            />
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Broadcast Image
              </Label>
              <ImageUploadSection
                image={broadcastImage}
                setImage={setBroadcastImage}
                updateSettings={{ mutate: () => {} }} // No auto-update for broadcast
                settingsKey="broadcast_image"
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                imageError={imageError}
                setImageError={setImageError}
                label="Broadcast Image"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-button"
                checked={includeButton}
                onCheckedChange={(checked) => setIncludeButton(checked as boolean)}
              />
              <label
                htmlFor="include-button"
                className="text-sm text-muted-foreground"
              >
                Include join button with message
              </label>
            </div>
            <Button 
              onClick={handleSendBroadcast} 
              disabled={isSending || !message.trim() || (filterType === 'plan' && !selectedPlanId) || isUploading}
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
