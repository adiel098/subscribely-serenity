
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";

interface MiniAppLinkButtonProps {
  onClick: () => void;
}

export const MiniAppLinkButton = ({ onClick }: MiniAppLinkButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        onClick={onClick} 
        size="sm"
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8"
      >
        <Copy className="h-3 w-3" />
        Copy Mini App Link
      </Button>
    </motion.div>
  );
};
