
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PriceFilterContentProps {
  priceRange: [number, number] | null;
  setPriceRange: (range: [number, number] | null) => void;
  onApply: () => void;
}

export const PriceFilterContent: React.FC<PriceFilterContentProps> = ({
  priceRange,
  setPriceRange,
  onApply
}) => {
  const MIN_PRICE = 0;
  const MAX_PRICE = 100;
  
  const [open, setOpen] = useState(true);
  const [localRange, setLocalRange] = useState<[number, number]>(priceRange || [MIN_PRICE, MAX_PRICE]);
  
  // Update local state when props change
  useEffect(() => {
    if (priceRange) {
      setLocalRange(priceRange);
    } else {
      setLocalRange([MIN_PRICE, MAX_PRICE]);
    }
  }, [priceRange]);
  
  const handleApply = () => {
    // Only set the filter if it's not the default range
    if (localRange[0] > MIN_PRICE || localRange[1] < MAX_PRICE) {
      setPriceRange(localRange);
    } else {
      setPriceRange(null);
    }
    onApply();
  };
  
  const formatPrice = (value: number) => {
    return `$${value}`;
  };
  
  return (
    <div className="space-y-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-sm font-medium">
          <span>Price Range</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="space-y-4">
            <Slider
              defaultValue={[MIN_PRICE, MAX_PRICE]}
              value={localRange}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1}
              onValueChange={(value) => setLocalRange(value as [number, number])}
              className="mb-6"
            />
            
            <div className="flex items-center justify-between">
              <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-lg text-sm">
                {formatPrice(localRange[0])}
              </div>
              <div className="text-gray-400 text-xs">to</div>
              <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-lg text-sm">
                {formatPrice(localRange[1])}
              </div>
            </div>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleApply}
            >
              Apply Filter
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
