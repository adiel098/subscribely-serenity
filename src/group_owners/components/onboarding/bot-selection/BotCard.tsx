
import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface BotCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  footerIcon: React.ReactNode;
  footerText: string;
  isSelected: boolean;
  onClick: () => void;
  iconBackground: string;
  footerBackground: string;
}

export const BotCard: React.FC<BotCardProps> = ({
  title,
  description,
  icon,
  benefits,
  footerIcon,
  footerText,
  isSelected,
  onClick,
  iconBackground,
  footerBackground,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      animate={{ scale: isSelected ? 1.03 : 1 }}
    >
      <Card 
        className={`h-full cursor-pointer border-2 transition-all ${
          isSelected 
            ? "border-primary bg-primary/5 shadow-lg" 
            : "border-gray-200 hover:border-primary/30"
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <div className={`${iconBackground} p-3 rounded-full`}>
              {icon}
            </div>
            {isSelected && (
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className={`${footerBackground} w-full p-3 rounded-md text-sm`}>
            <div className="flex items-start gap-2">
              {footerIcon}
              <p>{footerText}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
