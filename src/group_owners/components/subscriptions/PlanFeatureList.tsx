
import { CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <ul className="space-y-1.5 mt-4">
      {features.map((feature, index) => (
        <li 
          key={index} 
          className="flex items-center justify-between gap-2 p-2 bg-indigo-50/80 rounded-lg animate-fade-in group transition-all hover:bg-indigo-100/80"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <CheckIcon className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-gray-700 text-xs">{feature}</span>
          </div>
          
          {isEditable && onRemoveFeature && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveFeature(index)}
              className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-200"
            >
              <PlusIcon className="h-3 w-3 rotate-45" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
