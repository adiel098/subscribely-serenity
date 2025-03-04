
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodCardProps {
  id: string;
  provider: string;
  icon: React.ReactNode;
  price: number;
  isProcessing: boolean;
  onSelect: (provider: string) => void;
}

export const PaymentMethodCard = ({ 
  id, 
  provider, 
  icon, 
  price, 
  isProcessing, 
  onSelect 
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
      <Card className="h-full cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
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
        <CardFooter className="pt-2">
          <Button
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => onSelect(provider)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay ${price}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
