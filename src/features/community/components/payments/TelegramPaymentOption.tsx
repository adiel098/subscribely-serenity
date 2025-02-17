import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle } from "lucide-react";

interface TelegramPaymentOptionProps {
  icon: string;
  title: string;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const TelegramPaymentOption = ({
  icon,
  title,
  description,
  isSelected,
  onSelect
}: TelegramPaymentOptionProps) => {
  return (
    <Card
      className={`group transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-2 border-primary shadow-md' : 'border'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="space-y-1">
        <div className="relative">
          <img
            src={icon}
            alt={title}
            className="w-12 h-12 object-contain mx-auto"
          />
          <div className="absolute top-0 right-0">
            {isSelected ? (
              <Check className="h-4 w-4 text-green-500 bg-white rounded-full shadow" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300" />
            )}
          </div>
        </div>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="text-center text-sm text-muted-foreground">
          {description}
        </CardContent>
      )}
    </Card>
  );
};
