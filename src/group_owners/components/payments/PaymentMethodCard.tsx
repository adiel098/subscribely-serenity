
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
  ChevronRight 
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
  communityId
}: PaymentMethodCardProps) => {
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  
  const handleConfigClick = () => {
    setIsConfigOpen(true);
    onConfigure();
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-full"
      >
        <Card className="relative h-full border hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2 text-lg">
                {imageSrc ? (
                  <div className="p-1.5 rounded-full bg-white shadow-sm flex items-center justify-center w-10 h-10">
                    <img src={imageSrc} alt={title} className="w-7 h-7 object-contain" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-600 w-10 h-10 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <span>{title}</span>
              </CardTitle>
              {isConfigured && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Configured
                </Badge>
              )}
            </div>
            {description && <CardDescription className="mt-2 text-xs">{description}</CardDescription>}
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="flex justify-between items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                )}
                <span className="text-xs font-medium">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={onToggle}
                disabled={!isConfigured}
                className="data-[state=checked]:bg-indigo-600 h-5 w-9"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 px-4">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors gap-1 text-xs py-1.5 px-3 h-auto max-w-40 mx-auto"
              onClick={handleConfigClick}
            >
              {isConfigured ? (
                <>
                  <Settings2 className="h-3.5 w-3.5" />
                  Edit Config
                </>
              ) : (
                <>
                  <Settings2 className="h-3.5 w-3.5" />
                  Configure
                </>
              )}
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Button>
          </CardFooter>
          {!isConfigured && (
            <div className="absolute bottom-0 right-0 p-2">
              <div className="text-amber-500">
                <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
              </div>
            </div>
          )}
          {isConfigured && (
            <div className="absolute bottom-2 right-2">
              <div className="text-green-500">
                <Lock className="h-3.5 w-3.5" />
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
                <div className="p-2 rounded-full bg-white shadow-sm flex items-center justify-center w-10 h-10">
                  <img src={imageSrc} alt={title} className="w-7 h-7 object-contain" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 w-10 h-10 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <span>Configure {title}</span>
            </DialogTitle>
            <DialogDescription>
              Enter your {title} API credentials securely to enable payments
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodConfig 
            provider={provider} 
            communityId={communityId} 
            onSuccess={() => setIsConfigOpen(false)}
            imageSrc={imageSrc}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
