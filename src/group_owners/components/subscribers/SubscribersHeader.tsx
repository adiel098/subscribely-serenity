
import { Button } from "@/components/ui/button";
import { Download, Loader2, RotateCcw, Users } from "lucide-react";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  onReset?: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ onExport, onReset = () => {}, isUpdating }: SubscribersHeaderProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
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
          <Button 
            variant="outline" 
            onClick={onReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onExport}
            className="bg-green-50/80 hover:bg-green-100/90 border-green-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
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
