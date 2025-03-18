
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
    </div>
  );
};
