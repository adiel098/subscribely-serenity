
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsIcon, CheckCircle, AlertCircle, Loader2, LucideIcon } from "lucide-react";
import { PaymentMethodConfig } from "./PaymentMethodConfig";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  isConfigured: boolean;
  onToggle: (active: boolean) => void;
  onConfigure: () => void;
  imageSrc?: string;
  provider: string;
  ownerId?: string;
}

export const PaymentMethodCard = ({
  title,
  description,
  icon: Icon,
  isActive,
  isConfigured,
  onToggle,
  onConfigure,
  imageSrc,
  provider,
  ownerId
}: PaymentMethodCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleConfigureSuccess = () => {
    setIsConfiguring(false);
    setIsOpen(false);
    if (!isActive && isConfigured) {
      onToggle(true);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden h-full transition-all duration-200 relative",
        isActive ? "border-indigo-300 shadow-sm hover:shadow-md" : "hover:border-gray-300"
      )}>
        {imageSrc && (
          <div className="relative h-36 overflow-hidden border-b">
            <img 
              src={imageSrc} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </div>
            <Switch 
              checked={isActive} 
              onCheckedChange={onToggle}
              disabled={!isConfigured}
              className={cn(
                "data-[state=checked]:bg-indigo-600",
                !isConfigured && "cursor-not-allowed opacity-50"
              )}
            />
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="py-0">
          <div className="flex items-center gap-2 h-6">
            {isConfigured ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  Configured
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">
                  Needs configuration
                </span>
              </>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full gap-2 hover:bg-indigo-50"
                onClick={() => setIsConfiguring(true)}
              >
                <SettingsIcon className="h-4 w-4" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-indigo-600" />
                  Configure {title}
                </DialogTitle>
                <DialogDescription>
                  Set up your {title} payment gateway for all your communities
                </DialogDescription>
              </DialogHeader>
              
              {isConfiguring ? (
                <PaymentMethodConfig 
                  provider={provider}
                  ownerId={ownerId}
                  onSuccess={handleConfigureSuccess}
                  imageSrc={imageSrc}
                />
              ) : (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
