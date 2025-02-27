
import { Send } from "lucide-react";
import { useState } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBroadcast } from "@/group_owners/hooks/useBroadcast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BroadcastCard } from "./broadcast/BroadcastCard";

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
        <BroadcastCard
          message={message}
          setMessage={setMessage}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
          includeButton={includeButton}
          setIncludeButton={setIncludeButton}
          broadcastImage={broadcastImage}
          setBroadcastImage={setBroadcastImage}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          imageError={imageError}
          setImageError={setImageError}
          handleSendBroadcast={handleSendBroadcast}
          isSending={isSending}
          plans={plans}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
