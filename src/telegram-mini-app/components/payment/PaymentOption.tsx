
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleDashed } from "lucide-react";

interface PaymentOptionProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const PaymentOption: React.FC<PaymentOptionProps> = ({
  id,
  name,
  icon,
  selected,
  onSelect,
  disabled = false
}) => {
  return (
    <Card
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all duration-200 flex items-center justify-between",
        selected
          ? "border-indigo-500 bg-indigo-50/50"
          : "border-gray-200 bg-white hover:border-indigo-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onSelect}
      data-testid={`payment-option-${id}`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-indigo-600">{icon}</div>
        <span className="font-medium text-gray-800">{name}</span>
      </div>
      <div>
        {selected ? (
          <CircleCheck className="h-5 w-5 text-indigo-600" />
        ) : (
          <CircleDashed className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </Card>
  );
};
