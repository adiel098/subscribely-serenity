
import { RefreshCw, FileSpreadsheet, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({
  onUpdateStatus,
  onExport,
  isUpdating
}: SubscribersHeaderProps) => {
  return (
    <div className="flex items-center">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
        Subscribers <Sparkles className="h-5 w-5 ml-1 text-amber-400" />
      </h1>
    </div>
  );
};
