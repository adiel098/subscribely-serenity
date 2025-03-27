
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponFormSchema, CouponFormValues } from "./CouponFormSchema";
import { CalendarIcon, Loader2, SaveIcon, TagIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Coupon, UpdateCouponData } from "@/group_owners/hooks/types/coupon.types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface EditCouponDialogProps {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateCouponData) => Promise<void>;
}

export const EditCouponDialog = ({
  coupon,
  open,
  onOpenChange,
  onSubmit,
}: EditCouponDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      description: "",
      discount_type: "percentage",
      discount_amount: 10,
      max_uses: undefined,
      is_active: true,
      expires_at: undefined,
    },
  });

  // Update form values when coupon changes
  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_amount: coupon.discount_amount,
        max_uses: coupon.max_uses || undefined,
        is_active: coupon.is_active,
        expires_at: coupon.expires_at ? new Date(coupon.expires_at) : undefined,
      });
    }
  }, [coupon, form]);

  const handleSubmit = async (data: CouponFormValues) => {
    if (!coupon) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateCouponData = {
        id: coupon.id,
        ...data,
        expires_at: data.expires_at 
          ? new Date(data.expires_at).toISOString() 
          : null,
      };
      await onSubmit(updateData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating coupon:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!coupon) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-indigo-500" />
            Edit Coupon
          </DialogTitle>
          <DialogDescription>
            Modify your discount coupon settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SUMMER2023"
                      {...field}
                      autoCapitalize="characters"
                      className="uppercase"
                    />
                  </FormControl>
                  <FormDescription>
                    A unique code for your coupon (letters, numbers, hyphens, underscores)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summer discount for new subscribers"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          step={field.value === "percentage" ? 1 : 0.01}
                          {...field}
                        />
                        <div className="absolute right-3 top-2.5 text-muted-foreground">
                          {form.watch("discount_type") === "percentage" ? "%" : "$"}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Unlimited"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for unlimited uses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`h-10 w-full justify-start text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Never expires</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="flex items-center justify-center p-2 border-t">
                          <Button
                            variant="ghost"
                            className="text-xs"
                            onClick={() => field.onChange(undefined)}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Clear
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Leave empty for no expiration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable or disable this coupon
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
