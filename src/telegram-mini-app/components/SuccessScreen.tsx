
import React from "react";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessScreenProps } from "../types";

export const SuccessScreen = ({ communityName, communityInviteLink }: SuccessScreenProps) => {
  const handleJoinClick = () => {
    if (communityInviteLink) {
      window.open(communityInviteLink, "_blank");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen -mt-16 animate-fade-in">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-2">Payment Successful!</h1>
      
      <p className="text-gray-600 text-center mb-8 max-w-xs">
        {communityName 
          ? `Thank you for subscribing to ${communityName}. Your access has been activated.`
          : "Thank you for your subscription. Your access has been activated."}
      </p>
      
      {communityInviteLink && (
        <Button 
          onClick={handleJoinClick}
          className="flex items-center"
        >
          Join Community <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
