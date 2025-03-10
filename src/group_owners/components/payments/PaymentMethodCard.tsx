
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
import { Settings2, CheckCircle, AlertCircle, Lock } from "lucide-react";
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
  imageSrc?: string;
}

export const PaymentMethodCard = ({ 
  icon: Icon, 
  title, 
  description,
  isActive,
  onToggle,
  isConfigured,
  onConfigure,
  imageSrc
}: PaymentMethodCardProps) => (
  <motion.div
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="h-full"
  >
    <Card className="relative h-full border hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-lg group overflow-hidden bg-white">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-lg">
            {imageSrc ? (
              <div className="p-2 rounded-full bg-white shadow-sm flex items-center justify-center w-12 h-12">
                <img src={imageSrc} alt={title} className="w-9 h-9 object-contain" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 w-12 h-12 flex items-center justify-center">
                <Icon className="h-6 w-6" />
              </div>
            )}
            <span>{title}</span>
          </CardTitle>
          {isConfigured && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Configured
            </Badge>
          )}
        </div>
        {description && <CardDescription className="mt-3">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2">
            {isActive ? (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
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
            className="w-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors gap-1.5"
            onClick={onConfigure}
          >
            <Settings2 className="h-4 w-4" />
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
      {isConfigured && (
        <div className="absolute bottom-3 right-3">
          <div className="text-green-500">
            <Lock className="h-4 w-4" />
          </div>
        </div>
      )}
    </Card>
  </motion.div>
);
