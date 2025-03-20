
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle } from "lucide-react";
import { Subscription } from "../../../services/memberService";

interface MembershipActionButtonsProps {
  onCancelClick: () => void;
  onRenew: () => void;
}

export const MembershipActionButtons: React.FC<MembershipActionButtonsProps> = ({
  onCancelClick,
  onRenew,
}) => {
  return (
    <div className="flex gap-2 pt-1">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100"
        onClick={onCancelClick}
      >
        <XCircle className="h-4 w-4 mr-1.5" />
        Cancel 🚫
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-100 animate-pulse"
        onClick={onRenew}
      >
        <RefreshCw className="h-4 w-4 mr-1.5" />
        Renew 🔄
      </Button>
    </div>
  );
};
