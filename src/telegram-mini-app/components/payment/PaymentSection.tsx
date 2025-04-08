import { useState, useEffect } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentMethods } from "../PaymentMethods";
import { CouponInput } from "../coupon/CouponInput";
import { PricingSummary } from "./PricingSummary";
import { CheckCouponResult } from "@/group_owners/hooks/types/coupon.types";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { useApplyCoupon } from "@/group_owners/hooks/coupon/useApplyCoupon";
import { CreditCard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface PaymentSectionProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  onPaymentStart?: () => void;
  onPaymentError?: (error: string) => void;
  isProcessing?: boolean;
  communityInviteLink?: string | null;
  showSuccess: boolean;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;  
  lastName?: string;
  activeSubscription?: Subscription | null;
  communityId: string;
}

export const PaymentSection = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  onPaymentStart,
  onPaymentError,
  isProcessing,
  communityInviteLink,
  showSuccess,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  activeSubscription,
  communityId
}: PaymentSectionProps) => {
  const [appliedCoupon, setAppliedCoupon] = useState<CheckCouponResult | null>(null);
  const { mutateAsync: applyCoupon } = useApplyCoupon();

  // When payment method changes or payment starts, we need to apply the coupon
  useEffect(() => {
    const handleApplyCouponToPayment = async () => {
      if (appliedCoupon?.isValid && appliedCoupon.coupon && isProcessing) {
        try {
          await applyCoupon({
            couponId: appliedCoupon.coupon.id,
            telegramUserId: telegramUserId,
          });
          console.log('Coupon applied to payment');
        } catch (error) {
          console.error('Failed to apply coupon to payment:', error);
        }
      }
    };
    
    handleApplyCouponToPayment();
  }, [isProcessing, appliedCoupon, applyCoupon, telegramUserId]);
  
  // When plan changes, reset the applied coupon
  useEffect(() => {
    setAppliedCoupon(null);
  }, [selectedPlan]);
  
  const handleApplyCoupon = (couponResult: CheckCouponResult) => {
    setAppliedCoupon(couponResult);
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };
  
  // Calculate the final price after any discount
  const finalPrice = appliedCoupon?.isValid 
    ? appliedCoupon.finalPrice || selectedPlan.price
    : selectedPlan.price;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-xl p-4 shadow-sm">
        <motion.div
          className="text-center space-y-3 mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="px-5 py-2 text-base font-medium bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
            <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
            Payment Details <Sparkles className="h-4 w-4 ml-1 text-amber-500" />
          </Badge>
        </motion.div>
          
        <PricingSummary 
          plan={selectedPlan} 
          appliedCoupon={appliedCoupon} 
        />
        
        <CouponInput 
          communityId={communityId}
          planPrice={selectedPlan.price}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          appliedCoupon={appliedCoupon}
        />
      </div>
      
      <PaymentMethods
        selectedPlan={{
          ...selectedPlan,
          price: finalPrice, // Use the final price after discount
        }}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={onPaymentMethodSelect}
        onCompletePurchase={onCompletePurchase}
        onPaymentStart={onPaymentStart}
        onPaymentError={onPaymentError}
        isProcessing={isProcessing}
        communityInviteLink={communityInviteLink}
        showSuccess={showSuccess}
        telegramUserId={telegramUserId}
        telegramUsername={telegramUsername}
        firstName={firstName}
        lastName={lastName}
        activeSubscription={activeSubscription}
        communityId={communityId}
      />
    </div>
  );
};
