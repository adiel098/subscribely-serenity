
import { motion } from "framer-motion";
import { CreditCard, Wallet, Bitcoin, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PAYMENT_METHOD_IMAGES } from "@/group_owners/data/paymentMethodsData";

interface PaymentMethod {
  id: string;
  provider: string;
  is_active: boolean;
}

interface PlatformPaymentMethodsGridProps {
  paymentMethods: PaymentMethod[] | null;
  isLoading: boolean;
  selectedPlan: any;
  isProcessing: boolean;
  onSelectPaymentMethod: (method: string) => void;
}

export const PlatformPaymentMethodsGrid = ({
  paymentMethods,
  isLoading,
  selectedPlan,
  isProcessing,
  onSelectPaymentMethod
}: PlatformPaymentMethodsGridProps) => {
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-indigo-500" />;
      case 'paypal':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'crypto':
        return <Bitcoin className="h-5 w-5 text-orange-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {paymentMethods && paymentMethods.length > 0 ? (
        paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full cursor-pointer hover:border-indigo-300 transition-all">
              {PAYMENT_METHOD_IMAGES[method.provider] && (
                <div className="w-full overflow-hidden">
                  <AspectRatio ratio={16/9} className="bg-gray-100">
                    <img 
                      src={PAYMENT_METHOD_IMAGES[method.provider]} 
                      alt={`${method.provider} payment`}
                      className="w-full h-full object-contain p-2"
                    />
                  </AspectRatio>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6">
                    {getPaymentMethodIcon(method.provider)}
                  </span>
                  <span className="capitalize">{method.provider}</span>
                </CardTitle>
                <CardDescription>
                  Pay with {method.provider}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => onSelectPaymentMethod(method.provider)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ${selectedPlan?.price}
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="col-span-3 p-6 text-center border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">No payment methods are currently available. Please try again later.</p>
        </div>
      )}
    </div>
  );
};
