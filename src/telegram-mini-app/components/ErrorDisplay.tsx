
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  errorMessage: string;
  telegramUserId?: string | null;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  errorMessage, 
  telegramUserId, 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-sm border border-red-100">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-red-700">User Identification Error</h1>
          <p className="text-gray-500 text-sm">
            {errorMessage}
          </p>
        </div>
        
        <Button 
          onClick={onRetry}
          className="w-full bg-primary/90 hover:bg-primary"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>
        
        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-xs text-center text-gray-400">
            Error details: Unable to properly identify your Telegram account.
            <br/>Technical ID: {telegramUserId || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
};
