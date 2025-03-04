
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, Users } from "lucide-react";
import { motion } from "framer-motion";

interface SubscribersHeaderProps {
  onUpdateStatus: () => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ 
  onUpdateStatus, 
  onExport, 
  isUpdating 
}: SubscribersHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center space-x-3"
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Subscribers
            </h1>
            <p className="text-sm text-gray-500">
              Manage your community subscribers and monitor their subscription status
            </p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center space-x-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdateStatus}
            disabled={isUpdating}
            className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Update Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
        </motion.div>
      </div>
      <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
    </motion.div>
  );
};
