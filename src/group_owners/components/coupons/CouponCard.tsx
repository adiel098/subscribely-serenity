
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coupon } from "@/group_owners/hooks/types/coupon.types";
import { CalendarIcon, Copy, CreditCard, Edit, Percent, Tag, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

export const CouponCard = ({ coupon, onEdit, onDelete }: CouponCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast({
      title: "Code copied",
      description: `Coupon code "${coupon.code}" copied to clipboard`,
    });
  };

  const handleDelete = () => {
    onDelete(coupon);
  };

  return (
    <Card className="border-muted shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-500" />
            {coupon.code}
          </CardTitle>
          <Badge 
            variant={coupon.is_active ? "success" : "destructive"} 
            className="text-xs font-medium"
          >
            {coupon.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3 text-sm">
        {coupon.description && (
          <p className="text-muted-foreground">{coupon.description}</p>
        )}
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {coupon.discount_type === 'percentage' ? (
              <Percent className="h-4 w-4 text-green-500" />
            ) : (
              <CreditCard className="h-4 w-4 text-green-500" />
            )}
            <span className="font-medium">
              {coupon.discount_type === 'percentage' 
                ? `${coupon.discount_amount}% off` 
                : `${formatCurrency(coupon.discount_amount)} off`}
            </span>
          </div>
          
          {coupon.expires_at && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-amber-500" />
              <span>Expires: {format(new Date(coupon.expires_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          {coupon.max_uses && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Used {coupon.used_count || 0} of {coupon.max_uses} times
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleCopyCode}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => onEdit(coupon)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
