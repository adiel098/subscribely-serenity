
import { Button } from "@/components/ui/button";
import { Copy, Sparkles } from "lucide-react";
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
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8 font-medium"
      >
        <Sparkles className="h-3.5 w-3.5" />
        העתק קישור למיני אפ
      </Button>
    </motion.div>
  );
};
