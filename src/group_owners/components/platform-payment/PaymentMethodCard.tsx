
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

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
  return (
    <motion.div
      key={id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full cursor-pointer hover:border-indigo-300 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            <span className="capitalize">{provider}</span>
          </CardTitle>
          <CardDescription>
            Pay with {provider}
          </CardDescription>
        </CardHeader>
        <CardFooter>
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
