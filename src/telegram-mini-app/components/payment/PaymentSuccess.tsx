
import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PaymentSuccessProps {
  inviteLink?: string;
  onClose?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ 
  inviteLink,
  onClose 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 text-center shadow-md border-green-100">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your subscription has been successfully activated.
        </p>
        
        {inviteLink && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Join the community with this invite link:</p>
            <div className="bg-gray-100 p-3 rounded-md text-sm break-all">
              <a 
                href={inviteLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {inviteLink}
              </a>
            </div>
          </div>
        )}
        
        {onClose && (
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        )}
      </Card>
    </motion.div>
  );
};
