
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Tag, X } from "lucide-react";
import { useCheckCoupon } from "@/group_owners/hooks/coupon/useCheckCoupon";
import { CheckCouponResult } from "@/group_owners/hooks/types/coupon.types";
import { formatCurrency } from "@/lib/utils";

interface CouponInputProps {
  communityId: string;
  planPrice: number;
  onApplyCoupon: (couponResult: CheckCouponResult) => void;
  onRemoveCoupon: () => void;
  appliedCoupon: CheckCouponResult | null;
}

export const CouponInput = ({
  communityId,
  planPrice,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState("");
  const checkCoupon = useCheckCoupon();

  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) return;
    
    await checkCoupon.mutateAsync(
      {
        couponCode: couponCode.trim(),
        communityId,
        planPrice,
      },
      {
        onSuccess: (result) => {
          if (result.isValid) {
            onApplyCoupon(result);
          }
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckCoupon();
    }
  };

  if (appliedCoupon?.isValid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-green-800">
              {appliedCoupon.message}
            </p>
            <p className="text-xs text-green-600">
              {formatCurrency(planPrice)} → {formatCurrency(appliedCoupon.finalPrice || 0)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveCoupon}
          className="h-7 w-7 p-0 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-sm mb-2 flex items-center">
        <Tag className="h-3.5 w-3.5 mr-1.5" />
        Have a coupon code?
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="h-9"
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleCheckCoupon}
          disabled={!couponCode.trim() || checkCoupon.isPending}
          className="h-9"
        >
          {checkCoupon.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {checkCoupon.data && !checkCoupon.data.isValid && (
        <p className="text-destructive text-xs mt-1">
          {checkCoupon.data.message}
        </p>
      )}
    </div>
  );
};
