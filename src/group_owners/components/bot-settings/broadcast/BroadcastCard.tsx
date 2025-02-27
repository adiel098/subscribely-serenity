
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilterTypeSelector } from "./FilterTypeSelector";
import { BroadcastMessageForm } from "./BroadcastMessageForm";
import { BroadcastButton } from "./BroadcastButton";

interface BroadcastCardProps {
  message: string;
  setMessage: (value: string) => void;
  filterType: "all" | "active" | "expired" | "plan";
  setFilterType: (value: "all" | "active" | "expired" | "plan") => void;
  selectedPlanId: string;
  setSelectedPlanId: (value: string) => void;
  includeButton: boolean;
  setIncludeButton: (checked: boolean) => void;
  broadcastImage: string | null;
  setBroadcastImage: (image: string | null) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  imageError: string | null;
  setImageError: (error: string | null) => void;
  handleSendBroadcast: () => Promise<void>;
  isSending: boolean;
  plans?: any[];
}

export const BroadcastCard = ({
  message,
  setMessage,
  filterType,
  setFilterType,
  selectedPlanId,
  setSelectedPlanId,
  includeButton,
  setIncludeButton,
  broadcastImage,
  setBroadcastImage,
  isUploading,
  setIsUploading,
  imageError,
  setImageError,
  handleSendBroadcast,
  isSending,
  plans,
}: BroadcastCardProps) => {
  const isButtonDisabled = isSending || 
                           !message.trim() || 
                           (filterType === 'plan' && !selectedPlanId) || 
                           isUploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Broadcast Message</CardTitle>
        <CardDescription>
          Send a message to your community members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterTypeSelector 
          filterType={filterType}
          setFilterType={setFilterType}
          plans={plans}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
        />
        
        <BroadcastMessageForm 
          message={message}
          setMessage={setMessage}
          includeButton={includeButton}
          setIncludeButton={setIncludeButton}
          broadcastImage={broadcastImage}
          setBroadcastImage={setBroadcastImage}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          imageError={imageError}
          setImageError={setImageError}
        />
        
        <BroadcastButton 
          handleSendBroadcast={handleSendBroadcast}
          isSending={isSending}
          isDisabled={isButtonDisabled}
        />
      </CardContent>
    </Card>
  );
};
