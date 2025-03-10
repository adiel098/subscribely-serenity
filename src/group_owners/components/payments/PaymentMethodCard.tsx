
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  description,
  isActive,
  onToggle,
  isConfigured,
  onConfigure
}: PaymentMethodCardProps) => (
  <Card className="relative h-full border hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
          <span>{title}</span>
        </CardTitle>
        {isConfigured && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Configured
          </Badge>
        )}
      </div>
      {description && <CardDescription className="mt-2">{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center gap-4 p-2 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          {isActive ? (
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          )}
          <span className="text-sm font-medium">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          disabled={!isConfigured}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>
    </CardContent>
    {!isConfigured && (
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
          onClick={onConfigure}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Configure {title}
        </Button>
      </CardFooter>
    )}
    {!isConfigured && (
      <div className="absolute bottom-0 right-0 p-2">
        <div className="text-amber-500">
          <AlertCircle className="h-4 w-4 animate-pulse" />
        </div>
      </div>
    )}
  </Card>
);
