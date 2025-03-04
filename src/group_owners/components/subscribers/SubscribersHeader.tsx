
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Subscribers
            </h1>
            <p className="text-sm text-gray-500">
              Manage your community subscribers and monitor their subscription status
            </p>
          </div>
        </motion.div>
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdateStatus}
              disabled={isUpdating}
              className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              Update Member Status
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200 transition-all duration-300"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </div>
      </div>
      <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
    </div>
  );
};
