
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type CronJobTriggerButtonProps = {
  isLoading: boolean;
  onClick: () => Promise<void>;
  selectedCommunityId: string | null;
};

export const CronJobTriggerButton = ({ 
  isLoading, 
  onClick, 
  selectedCommunityId 
}: CronJobTriggerButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 bg-purple-50 border-purple-200 hover:bg-purple-200"
      onClick={onClick}
      disabled={isLoading}
    >
      <RefreshCw className={cn(
        "h-4 w-4 mr-1",
        isLoading && "animate-spin"
      )} />
      {selectedCommunityId ? "Check This Community" : "Check All"}
    </Button>
  );
};
