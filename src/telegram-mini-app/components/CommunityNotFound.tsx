
import { AlertTriangle } from "lucide-react";

interface CommunityNotFoundProps {
  errorMessage?: string;
}

export const CommunityNotFound = ({ errorMessage = "Community not found" }: CommunityNotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {errorMessage}
      </p>
      <p className="text-sm text-gray-500">
        If this issue persists, please contact support.
      </p>
    </div>
  );
};
