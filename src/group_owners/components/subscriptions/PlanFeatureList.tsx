
import { CheckIcon, SparklesIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PlanFeatureListProps {
  features: string[];
  onRemoveFeature?: (index: number) => void;
  isEditable?: boolean;
}

export const PlanFeatureList = ({ 
  features, 
  onRemoveFeature,
  isEditable = false 
}: PlanFeatureListProps) => {
  // Feature icon variants for visual interest
  const getFeatureIcon = (index: number) => {
    const icons = [
      <CheckIcon key="check" className="h-3 w-3 text-indigo-600" />,
      <StarIcon key="star" className="h-3 w-3 text-amber-500" />,
      <SparklesIcon key="sparkle" className="h-3 w-3 text-blue-500" />
    ];
    return icons[index % icons.length];
  };
  
  // No features
  if (features.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-indigo-700 mb-1 flex items-center">
        <StarIcon className="h-3 w-3 text-amber-500 mr-1.5" />
        Features:
      </h4>
      
      <ul className="space-y-1.5">
        {features.map((feature, index) => (
          <motion.li 
            key={index} 
            className="flex items-center justify-between gap-1 py-1 px-2 bg-gradient-to-r from-indigo-50 to-indigo-100/60 rounded-md text-sm group transition-all hover:from-indigo-100/80 hover:to-indigo-200/70 border border-indigo-100/50"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                {getFeatureIcon(index)}
              </div>
              <span className="text-gray-700 text-xs leading-tight line-clamp-1">{feature}</span>
            </div>
            
            {isEditable && onRemoveFeature && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => onRemoveFeature(index)}
                className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="10" 
                  height="10" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="rotate-45"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </Button>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
