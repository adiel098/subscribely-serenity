
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface PaymentMethodCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isConfigured: boolean;
  onConfigure: () => void;
}

export const PaymentMethodCard = ({ 
  icon: Icon, 
  title, 
  isActive,
  onToggle
}: PaymentMethodCardProps) => (
  <Card 
    className={`cursor-pointer transition-all duration-300 ${isActive ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md'}`}
    onClick={() => onToggle(true)}
  >
    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
      <div className={`p-3 rounded-lg ${isActive ? 'bg-primary/20' : 'bg-primary/10'} transition-colors`}>
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
    </CardContent>
  </Card>
);
