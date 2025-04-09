
import React from "react";
import { CheckCircle2 } from "lucide-react";

interface SuccessScreenProps {
  communityInviteLink?: string | null;
  inviteLink?: string | null;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ 
  communityInviteLink,
  inviteLink
}) => {
  // Use either inviteLink or communityInviteLink, preferring inviteLink if available
  const finalInviteLink = inviteLink || communityInviteLink;
  
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
      
      {finalInviteLink && (
        <div className="w-full max-w-md">
          <a
            href={finalInviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-center font-medium hover:bg-blue-600 transition-colors"
          >
            Join Telegram Group
          </a>
        </div>
      )}
    </div>
  );
};
