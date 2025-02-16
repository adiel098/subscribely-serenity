
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown } from "lucide-react";

interface SuccessScreenProps {
  communityInviteLink?: string | null;
}

export const SuccessScreen = ({ communityInviteLink }: SuccessScreenProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-gray-600">
          You can now join the community and access all premium features.
        </p>
        <a 
          href={communityInviteLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full"
        >
          <Button className="w-full py-6 text-lg font-semibold" size="lg">
            Join Community
            <Crown className="ml-2 h-5 w-5" />
          </Button>
        </a>
      </div>
    </div>
  );
};
