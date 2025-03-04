
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, X } from "lucide-react";
import { motion } from "framer-motion";

interface PlanFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitText: string;
}

export const PlanFormActions = ({ isSubmitting, onCancel, submitText }: PlanFormActionsProps) => {
  return (
    <DialogFooter className="pt-4 border-t mt-6">
      <div className="flex gap-3 w-full justify-end">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="gap-1 border-gray-300 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 gap-1 text-white shadow-sm hover:shadow-md transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitText}
          </Button>
        </motion.div>
      </div>
    </DialogFooter>
  );
};
