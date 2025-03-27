
import { useState, useEffect } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentMethods } from "../PaymentMethods";
import { CouponInput } from "../coupon/CouponInput";
import { PricingSummary } from "./PricingSummary";
import { CheckCouponResult } from "@/group_owners/hooks/types/coupon.types";
import { Card, CardContent } from "@/components/ui/card";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { useApplyCoupon } from "@/group_owners/hooks/coupon/useApplyCoupon";

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
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>
          
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
        </CardContent>
      </Card>
      
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
