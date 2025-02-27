
import { Image } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageUploadSection } from "../welcome-message/ImageUploadSection";

interface BroadcastMessageFormProps {
  message: string;
  setMessage: (value: string) => void;
  includeButton: boolean;
  setIncludeButton: (checked: boolean) => void;
  broadcastImage: string | null;
  setBroadcastImage: (image: string | null) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  imageError: string | null;
  setImageError: (error: string | null) => void;
}

export const BroadcastMessageForm = ({
  message,
  setMessage,
  includeButton,
  setIncludeButton,
  broadcastImage,
  setBroadcastImage,
  isUploading,
  setIsUploading,
  imageError,
  setImageError,
}: BroadcastMessageFormProps) => {
  return (
    <>
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
    </>
  );
};
