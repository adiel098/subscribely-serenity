
import { formatCurrency } from "@/lib/utils";
import { CheckCouponResult } from "@/group_owners/hooks/types/coupon.types";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { ArrowRight } from "lucide-react";

interface PricingSummaryProps {
  plan: Plan;
  appliedCoupon: CheckCouponResult | null;
}

export const PricingSummary = ({ plan, appliedCoupon }: PricingSummaryProps) => {
  // Calculate final price
  const regularPrice = plan.price;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalPrice = appliedCoupon?.finalPrice !== undefined
    ? appliedCoupon.finalPrice
    : regularPrice;

  // Format interval for display
  const getIntervalText = (interval: string) => {
    switch (interval) {
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case 'half-yearly': return '6 months';
      case 'yearly': return 'year';
      case 'one-time': return 'one-time payment';
      case 'lifetime': return 'lifetime access';
      default: return interval;
    }
  };

  return (
    <div className="bg-muted/40 border rounded-lg p-4 mt-4">
      <h3 className="font-medium mb-3">Order Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Plan</span>
          <span className="font-medium">{plan.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Duration</span>
          <span>{getIntervalText(plan.interval)}</span>
        </div>
        
        {appliedCoupon?.isValid && (
          <>
            <div className="flex justify-between">
              <span>Regular price</span>
              <span>{formatCurrency(regularPrice)}</span>
            </div>
            
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
            
            <div className="h-px bg-border my-2" />
          </>
        )}
        
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span className="text-base">
            {appliedCoupon?.isValid && regularPrice !== finalPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through text-sm">
                  {formatCurrency(regularPrice)}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-green-600">{formatCurrency(finalPrice)}</span>
              </div>
            ) : (
              formatCurrency(finalPrice)
            )}
          </span>
        </div>
        
        {plan.has_trial_period && plan.trial_days && plan.trial_days > 0 && (
          <div className="mt-2 text-indigo-600 text-xs border border-indigo-200 bg-indigo-50 rounded-md p-2">
            Starts with a {plan.trial_days}-day free trial
          </div>
        )}
      </div>
    </div>
  );
};
