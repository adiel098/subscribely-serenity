
import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PriceFilterContent } from "./filters/PriceFilterContent";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: [number, number] | null;
  setPriceRange: (range: [number, number] | null) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery,
  priceRange,
  setPriceRange
}) => {
  const [open, setOpen] = useState(false);

  const handleClearFilter = () => {
    setPriceRange(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative"
    >
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <Search className="h-4 w-4" />
          </motion.div>
          
          <Input
            type="text"
            placeholder="Search communities..."
            className="w-full pl-10 pr-4 py-2 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery("")}
            >
              <span className="sr-only">Clear search</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`rounded-xl h-10 ${priceRange ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-purple-100'}`}
            >
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Filter
              {priceRange && <span className="ml-1 text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">1</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-3 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Filters</h3>
                {priceRange && (
                  <Button 
                    variant="link" 
                    className="text-xs h-auto p-0 text-purple-600" 
                    onClick={handleClearFilter}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <PriceFilterContent 
                priceRange={priceRange} 
                setPriceRange={setPriceRange} 
                onApply={() => setOpen(false)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
};
