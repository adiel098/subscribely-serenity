
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download } from "lucide-react";

interface SubscribersActionsProps {
  onRefresh: () => void;
}

export const SubscribersActions: React.FC<SubscribersActionsProps> = ({
  onRefresh,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
      
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};
