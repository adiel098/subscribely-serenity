
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PaymentMethodCardProps {
  id: string;
  provider: string;
  icon: React.ReactNode;
  price: number;
  isProcessing: boolean;
  onSelect: (provider: string) => void;
  isSelected?: boolean;
  imageSrc?: string;
}

export const PaymentMethodCard = ({ 
  id, 
  provider, 
  icon, 
  isProcessing, 
  onSelect,
  isSelected = false,
  imageSrc
}: PaymentMethodCardProps) => {
  // Check if this is a demo payment method
  const isDemo = id.startsWith('demo-');

  // Animation variant for card items
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      key={id}
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`h-full cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' 
            : 'hover:border-indigo-300 hover:shadow-md'
        }`}
        onClick={() => onSelect(provider)}
      >
        {imageSrc && (
          <div className="w-full h-24 overflow-hidden">
            <AspectRatio ratio={16/9} className="bg-gray-100">
              <img 
                src={imageSrc} 
                alt={`${provider} payment`}
                className="w-full h-full object-contain p-2"
              />
            </AspectRatio>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6">{icon}</span>
              <span className="capitalize">{provider}</span>
            </div>
            {isDemo && (
              <Badge className="bg-green-500 hover:bg-green-600">Demo</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Pay with {provider} {isDemo && "(Test Mode)"}
          </CardDescription>
        </CardHeader>
        {isProcessing && (
          <CardContent className="pt-0 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};
