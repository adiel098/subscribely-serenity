
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
        <Card className="relative h-full border hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden bg-white max-w-[320px] mx-auto">
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
              {isConfigured && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-sm">
                  <CheckCircle className="h-3 w-3" />
                  Configured
                </Badge>
              )}
            </div>
            {description && <CardDescription className="mt-3 text-sm">{description}</CardDescription>}
          </CardHeader>
          <CardContent className="px-5 py-3">
            {/* Content area */}
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
                    <span>Edit</span>
                  </>
                ) : (
                  <>
                    <Settings2 className="h-4 w-4" />
                    <span>Configure</span>
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
                  {isActive ? 'Active' : 'Inactive'}
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
              <span>Configure {title}</span>
            </DialogTitle>
            <DialogDescription className="text-base">
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
