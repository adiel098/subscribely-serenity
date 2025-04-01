
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Send, Image as ImageIcon, Loader2, Users, Filter, ArrowRight } from "lucide-react";
import { FilterTypeSelector } from "./FilterTypeSelector";
import { useBroadcast } from "@/group_owners/hooks/useBroadcast";
import { toast } from "sonner";
import { ImageUploadSection } from "../welcome-message/ImageUploadSection";
import { MessagePreview } from "../MessagePreview";
import { BroadcastButton } from "./BroadcastButton";

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

  const {
    sendBroadcast,
    isLoading
  } = useBroadcast();

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (filterType === 'plan' && !selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    if (isUploading) {
      toast.error("Please wait for image upload to complete");
      return;
    }
    setIsSending(true);
    try {
      sendBroadcast(
        entityId,
        entityType,
        message,
        filterType,
        includeButton,
        undefined, // buttonText parameter
        undefined, // buttonUrl parameter
        image
      ).then(data => {
        if (data && data.success) {
          toast.success(`Message sent to ${data.sent_count || 0} recipients 🎉`);
          setMessage("");
        } else {
          toast.error(`Failed to send broadcast: ${data?.message || 'Unknown error'}`);
        }
        setIsSending(false);
      }).catch(error => {
        console.error('Error sending broadcast:', error);
        toast.error('An error occurred while sending the broadcast');
        setIsSending(false);
      });
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('An error occurred while sending the broadcast');
      setIsSending(false);
    }
  };

  return <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="filter-type" className="text-indigo-700 flex items-center font-medium">
          <Users className="h-4 w-4 mr-1.5" />
          Select Recipients
        </Label>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <FilterTypeSelector value={filterType} onChange={setFilterType} entityId={entityId} entityType={entityType} selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-indigo-700 flex items-center font-medium">
          <ArrowRight className="h-4 w-4 mr-1.5" />
          Message
        </Label>
        <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your broadcast message here..." className="min-h-[158px] border-indigo-200 focus:border-indigo-300 focus:ring-indigo-200" />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            {message.length}/1000 characters
          </p>
          {message.length > 800 && <p className="text-xs text-amber-600">
              Getting close to the limit! 📏
            </p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="flex items-center text-indigo-700 font-medium">
          <ImageIcon className="h-4 w-4 mr-1.5" />
          Add Image (Optional)
        </Label>
        <ImageUploadSection image={image} setImage={setImage} updateSettings={{
        mutate: () => {}
      }} settingsKey="broadcast_image" isUploading={isUploading} setIsUploading={setIsUploading} imageError={imageError} setImageError={setImageError} label="Upload Image 🖼️" />
        <p className="text-xs text-muted-foreground">
          Images increase engagement by up to 80%! 📈
        </p>
      </div>
      
      <div className="flex items-center space-x-2 py-2 px-3 bg-violet-50 rounded-lg border border-violet-100">
        <Switch id="include-button" checked={includeButton} onCheckedChange={setIncludeButton} className="data-[state=checked]:bg-violet-600" />
        <Label htmlFor="include-button" className="cursor-pointer text-violet-800 text-sm">
          Include "Join Community" button 🔗
        </Label>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSendBroadcast} 
          disabled={isSending || !message.trim() || filterType === 'plan' && !selectedPlanId || isUploading} 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm w-full"
        >
          {isSending ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </> : <>
              <Send className="mr-2 h-4 w-4" />
              Send Broadcast
            </>}
        </Button>
      </div>
    </div>;
};
