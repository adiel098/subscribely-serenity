
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NoLinkState = () => {
  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-700 max-w-sm">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-5 w-5" />
        <p>No invite link available</p>
      </div>
      <p className="text-sm mt-1">
        We couldn't find an invite link for this community. Please contact support or try refreshing the page.
      </p>
      <Button 
        variant="outline" 
        className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </div>
  );
};
