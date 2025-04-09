
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus, Download } from "lucide-react";

interface SubscribersActionsProps {
  onRefresh: () => void;
}

export const SubscribersActions: React.FC<SubscribersActionsProps> = ({
  onRefresh
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  );
};
