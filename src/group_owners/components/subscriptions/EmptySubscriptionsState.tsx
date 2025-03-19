
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SparklesIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface EmptySubscriptionsStateProps {
  onCreatePlan: () => void;
}

export const EmptySubscriptionsState: React.FC<EmptySubscriptionsStateProps> = ({ onCreatePlan }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full p-6 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
        <div className="flex flex-col items-center gap-4 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
          >
            <SparklesIcon className="h-8 w-8" />
          </motion.div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-semibold">No Subscription Plans Yet</h3>
            <p className="text-gray-600">
              Create subscription plans to offer to your community members. Define pricing, features, and billing cycles.
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={onCreatePlan}
              className="mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
