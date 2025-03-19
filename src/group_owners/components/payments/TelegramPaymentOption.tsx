
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TelegramPaymentOptionProps {
  icon: string;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  demoDelay?: number;
}

export const TelegramPaymentOption = ({ 
  icon, 
  title,
  isSelected,
  onSelect,
  disabled = false,
  demoDelay = 1500
}: TelegramPaymentOptionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (disabled) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, demoDelay));
    setIsProcessing(false);
    onSelect();
  };

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-300",
          isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md',
          disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
        )}
        onClick={handleClick}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
          {isProcessing ? (
            <motion.div 
              className="p-4"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div 
              className={cn(
                "p-4 rounded-full transition-colors",
                isSelected ? 'bg-primary/20' : 'bg-primary/10'
              )}
              animate={isSelected ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0px 0px 0px 0px rgba(99, 102, 241, 0.1)",
                  "0px 0px 0px 8px rgba(99, 102, 241, 0.1)",
                  "0px 0px 0px 0px rgba(99, 102, 241, 0.1)"
                ]
              } : {}}
              transition={{ 
                duration: 1.5, 
                repeat: isSelected ? Infinity : 0,
                repeatDelay: 1
              }}
            >
              <motion.img 
                src={icon} 
                alt={title} 
                className="h-12 w-12"
                animate={isSelected ? { 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ 
                  duration: 0.8, 
                  repeat: isSelected ? Infinity : 0,
                  repeatDelay: 2
                }}
              />
            </motion.div>
          )}
          <motion.h3 
            className="font-medium text-gray-900 text-lg"
            animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
            transition={{ 
              duration: 0.5, 
              repeat: isSelected ? Infinity : 0,
              repeatDelay: 2
            }}
          >
            {title}
          </motion.h3>
        </CardContent>
      </Card>
    </motion.div>
  );
};
