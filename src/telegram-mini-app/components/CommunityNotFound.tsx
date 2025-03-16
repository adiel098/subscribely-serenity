
import React from "react";
import { AlertTriangle } from "lucide-react";

interface CommunityNotFoundProps {
  communityId?: string;
  isCustomLink?: boolean;
  error?: string;
}

export const CommunityNotFound: React.FC<CommunityNotFoundProps> = ({ 
  communityId,
  isCustomLink = false,
  error
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="text-center space-y-4 p-6 glass-card rounded-xl max-w-md w-full shadow-lg">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-800">Community Not Found</h2>
        <p className="text-gray-600 text-lg">
          The community you're looking for couldn't be located
        </p>
        {communityId && (
          <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-500 my-3">
            <span className="font-medium">{isCustomLink ? "Custom link" : "ID"}:</span> {communityId}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-600 my-3">
            {error}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Please check the link and try again, or contact the community administrator
        </p>
        <a 
          href="https://t.me/" 
          className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md mt-4 transition-colors"
        >
          Return to Telegram
        </a>
      </div>
    </div>
  );
};
