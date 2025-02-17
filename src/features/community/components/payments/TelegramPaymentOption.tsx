
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

export interface TelegramPaymentOptionProps {
  isSelected: boolean;
  onSelect: () => void;
}

export const TelegramPaymentOption = ({ isSelected, onSelect }: TelegramPaymentOptionProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105",
        isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
        <div className={cn(
          "p-4 rounded-full transition-colors",
          isSelected ? 'bg-primary/20' : 'bg-primary/10'
        )}>
          <Send className="h-6 w-6" />
        </div>
        <h3 className="font-medium text-gray-900">Pay with Telegram</h3>
      </CardContent>
    </Card>
  );
};
