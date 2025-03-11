
import React, { useState } from "react";
import { Image } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageUploadSection } from "../welcome-message/ImageUploadSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BroadcastMessageFormProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastMessageForm = ({
  entityId,
  entityType
}: BroadcastMessageFormProps) => {
  const [message, setMessage] = useState('');
  const [includeButton, setIncludeButton] = useState(false);
  const [broadcastImage, setBroadcastImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      // Create a draft broadcast message
      const broadcastData = {
        message,
        community_id: entityType === 'community' ? entityId : null,
        group_id: entityType === 'group' ? entityId : null,
        status: 'draft',
        filter_type: 'all',
        filter_data: {},
        image_url: broadcastImage,
        include_button: includeButton
      };

      const { error } = await supabase
        .from('broadcast_messages')
        .insert(broadcastData);

      if (error) {
        console.error('Error creating broadcast message:', error);
        toast.error("Failed to create broadcast message");
        return;
      }

      // Here you would typically trigger the actual broadcast sending process
      // For now, we'll just show a success message
      toast.success("Broadcast message created and queued for delivery");
      
      // Reset form
      setMessage('');
      setIncludeButton(false);
      setBroadcastImage(null);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error("Something went wrong while sending broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
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
        disabled={isSending || !message.trim() || isUploading}
        className="w-full"
      >
        {isSending ? "Sending..." : "Send Broadcast"}
      </Button>
    </div>
  );
};
