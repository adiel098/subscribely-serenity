
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
import { 
  Settings2, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  ChevronRight, 
  Star,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentMethodConfig } from "./PaymentMethodConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentMethodCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isConfigured: boolean;
  onConfigure: () => void;
  imageSrc?: string;
  provider: string;
  communityId: string;
  isDefault?: boolean;
  onDefaultToggle?: (isDefault: boolean) => void;
}

export const PaymentMethodCard = ({ 
  icon: Icon, 
  title, 
  description,
  isActive,
  onToggle,
  isConfigured,
  onConfigure,
  imageSrc,
  provider,
  communityId,
  isDefault = false,
  onDefaultToggle
}: PaymentMethodCardProps) => {
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  
  const handleConfigClick = () => {
    setIsConfigOpen(true);
    onConfigure();
  };

  const handleDefaultToggle = (newValue: boolean) => {
    if (onDefaultToggle) {
      onDefaultToggle(newValue);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-full"
      >
        <Card className={`relative h-full border hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden bg-white max-w-[320px] mx-auto ${isDefault ? 'border-amber-300 bg-amber-50/30' : ''}`}>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-3 text-xl">
                {imageSrc ? (
                  <div className="p-2 rounded-full bg-white shadow-sm flex items-center justify-center w-12 h-12">
                    <img src={imageSrc} alt={title} className="w-8 h-8 object-contain" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 w-12 h-12 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                <span>{title}</span>
              </CardTitle>
              <div className="flex gap-2">
                {isDefault && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-amber-500" />
                          ברירת מחדל
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>זמין לכל הקהילות שלך</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isConfigured && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-sm">
                    <CheckCircle className="h-3 w-3" />
                    מוגדר
                  </Badge>
                )}
              </div>
            </div>
            {description && <CardDescription className="mt-3 text-sm">{description}</CardDescription>}
          </CardHeader>
          <CardContent className="px-5 py-3">
            {/* Content */}
            {onDefaultToggle && (
              <div className="flex items-center justify-between p-2 px-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">הפוך לברירת מחדל</span>
                </div>
                <Switch
                  checked={isDefault}
                  onCheckedChange={handleDefaultToggle}
                  disabled={!isConfigured}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4 px-5">
            <div className="flex items-center justify-between w-full gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors gap-2 text-sm py-2 px-3 h-auto"
                onClick={handleConfigClick}
              >
                {isConfigured ? (
                  <>
                    <Settings2 className="h-4 w-4" />
                    <span>ערוך</span>
                  </>
                ) : (
                  <>
                    <Settings2 className="h-4 w-4" />
                    <span>הגדר</span>
                  </>
                )}
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 border border-indigo-100 mr-6">
                {isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                )}
                <span className="text-sm font-medium">
                  {isActive ? 'פעיל' : 'לא פעיל'}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={onToggle}
                  disabled={!isConfigured}
                  className="data-[state=checked]:bg-indigo-600 h-5 w-10"
                />
              </div>
            </div>
          </CardFooter>
          {!isConfigured && (
            <div className="absolute bottom-0 right-0 p-2">
              <div className="text-amber-500">
                <AlertCircle className="h-4 w-4 animate-pulse" />
              </div>
            </div>
          )}
          {isConfigured && (
            <div className="absolute bottom-2 right-2">
              <div className="text-green-500">
                <Lock className="h-4 w-4" />
              </div>
            </div>
          )}
          {isDefault && (
            <div className="absolute top-0 right-0">
              <div className="w-16 h-16 overflow-hidden inline-block">
                <div className="h-2 w-2 bg-amber-400 rotate-45 transform origin-top-left absolute top-0 right-0 shadow-md"></div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {imageSrc ? (
                <div className="p-2 rounded-full bg-white shadow-sm flex items-center justify-center w-12 h-12">
                  <img src={imageSrc} alt={title} className="w-8 h-8 object-contain" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 w-12 h-12 flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <span>הגדר {title}</span>
            </DialogTitle>
            <DialogDescription className="text-base">
              הזן את פרטי ה-API של {title} באופן מאובטח כדי לאפשר תשלומים
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodConfig 
            provider={provider} 
            communityId={communityId} 
            onSuccess={() => setIsConfigOpen(false)}
            imageSrc={imageSrc}
            isDefault={isDefault}
            onDefaultChange={handleDefaultToggle}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
