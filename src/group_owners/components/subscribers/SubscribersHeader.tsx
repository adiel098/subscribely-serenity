
import { Loader2, Users } from "lucide-react";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ isUpdating }: SubscribersHeaderProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-800">
            <Users className="h-5 w-5 text-indigo-600" />
            Subscribers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage subscribers and track membership status
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isUpdating && (
            <div className="animate-pulse p-2 rounded-full bg-indigo-100">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
