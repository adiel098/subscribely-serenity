
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { FilterTypeSelector } from "./FilterTypeSelector";
import { useBroadcast } from "@/group_owners/hooks/useBroadcast";
import { toast } from "sonner";
import { ImageUploadSection } from "../welcome-message/ImageUploadSection";
import { MessagePreview } from "../MessagePreview";

interface BroadcastMessageFormProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastMessageForm = ({ 
  entityId, 
  entityType 
}: BroadcastMessageFormProps) => {
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired' | 'plan'>('all');
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [includeButton, setIncludeButton] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const { sendBroadcastMessage } = useBroadcast();

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (filterType === 'plan' && !selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }
    
    // Prevent sending if image is still uploading
    if (isUploading) {
      toast.error("Please wait for image upload to complete");
      return;
    }

    setIsSending(true);
    try {
      sendBroadcastMessage({
        entityId,
        entityType,
        message,
        filterType,
        includeButton,
        image, // Pass the image exactly as it is - telegramMessenger will handle it
        ...(filterType === 'plan' && { subscriptionPlanId: selectedPlanId })
      }, {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(`Message sent to ${data.sent_success || 0} recipients`);
            setMessage("");
            // Don't reset image and button settings to allow for similar follow-up messages
          } else {
            toast.error(`Failed to send broadcast: ${data.error}`);
          }
          setIsSending(false);
        },
        onError: (error) => {
          console.error('Error sending broadcast:', error);
          toast.error('An error occurred while sending the broadcast');
          setIsSending(false);
        }
      });
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('An error occurred while sending the broadcast');
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="filter-type">Select Recipients</Label>
        <FilterTypeSelector 
          value={filterType}
          onChange={setFilterType}
          entityId={entityId}
          entityType={entityType}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your broadcast message here..."
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {message.length}/1000 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Broadcast Image
        </Label>
        <ImageUploadSection 
          image={image}
          setImage={setImage}
          updateSettings={{ mutate: () => {} }}
          settingsKey="broadcast_image"
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          imageError={imageError}
          setImageError={setImageError}
          label="Upload Image"
        />
      </div>
      
      <div className="flex items-center space-x-2 py-2">
        <Switch
          id="include-button"
          checked={includeButton}
          onCheckedChange={setIncludeButton}
        />
        <Label htmlFor="include-button" className="cursor-pointer">
          Include "Join Community" button
        </Label>
      </div>
      
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium mb-3">Preview</h3>
        <MessagePreview 
          message={message}
          image={image}
          buttonText={includeButton ? "Join Community🚀" : undefined}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSendBroadcast} 
          disabled={isSending || !message.trim() || (filterType === 'plan' && !selectedPlanId) || isUploading}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Broadcast
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
