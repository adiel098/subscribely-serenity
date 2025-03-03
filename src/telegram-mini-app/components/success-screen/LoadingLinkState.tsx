
import React from "react";

export const LoadingLinkState = () => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 max-w-sm">
      <p className="font-medium">Loading invite link...</p>
      <p className="text-sm mt-1">
        Please wait while we retrieve your invite link.
      </p>
    </div>
  );
};
