
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, Users, CheckCircle } from "lucide-react";
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
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              Subscribers
              <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                Management
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor subscription status and manage community members effectively
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdateStatus}
              disabled={isUpdating}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </motion.div>
        </div>
      </motion.div>
      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
    </div>
  );
};
