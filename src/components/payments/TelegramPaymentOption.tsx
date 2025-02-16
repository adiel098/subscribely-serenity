
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface TelegramPaymentOptionProps {
  icon: React.ElementType;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const TelegramPaymentOption = ({ 
  icon: Icon, 
  title,
  isSelected,
  onSelect
}: TelegramPaymentOptionProps) => (
  <Card 
    className={`cursor-pointer transition-all duration-300 ${
      isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md'
    }`}
    onClick={onSelect}
  >
    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
      <div className={`p-3 rounded-lg ${
        isSelected ? 'bg-primary/20' : 'bg-primary/10'
      } transition-colors`}>
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
    </CardContent>
  </Card>
);
