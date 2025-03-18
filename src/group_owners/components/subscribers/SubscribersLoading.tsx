
import { Loader2 } from "lucide-react";

export const SubscribersLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
      <p className="text-gray-600">Loading subscribers data...</p>
    </div>
  );
};
