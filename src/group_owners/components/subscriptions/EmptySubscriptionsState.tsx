
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PackagePlus, SparklesIcon, Zap, Shield, Award, Users } from "lucide-react";

interface EmptySubscriptionsStateProps {
  onCreatePlan: () => void;
}

export const EmptySubscriptionsState: React.FC<EmptySubscriptionsStateProps> = ({ 
  onCreatePlan 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="border-2 border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50/40 to-purple-50/40 p-8 rounded-xl shadow-sm overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute bottom-0 -left-10 w-28 h-28 bg-purple-100 rounded-full opacity-30 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-4 rounded-full mb-6">
            <Users className="h-12 w-12 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Start Monetizing Your Community
          </h2>
          
          <p className="text-gray-600 max-w-md mb-8">
            Create your first subscription plan to start receiving payments from community members
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
            {[
              { 
                icon: <SparklesIcon className="h-6 w-6 text-indigo-500" />, 
                title: "Premium Content",
                description: "Turn your community into a revenue source" 
              },
              { 
                icon: <Shield className="h-6 w-6 text-purple-500" />, 
                title: "Exclusive Access",
                description: "Provide premium content to paying subscribers" 
              },
              { 
                icon: <Award className="h-6 w-6 text-amber-500" />, 
                title: "Multiple Tiers",
                description: "Create different subscription levels" 
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">{feature.icon}</div>
                  <h3 className="text-sm font-medium text-gray-800">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={onCreatePlan} 
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2.5 h-auto gap-2"
            >
              <Zap className="h-5 w-5" />
              Create First Subscription Plan
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
