import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscriptionPlans } from "@/hooks/community/useSubscriptionPlans";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "שם התוכנית חייב להכיל לפחות 2 תווים.",
  }),
  description: z.string().optional(),
  price: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "המחיר חייב להיות מספר חיובי.",
  }),
  interval: z.enum(['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time']),
  features: z.array(z.string()).optional(),
});

interface EditPlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editPlanData: {
    id: string;
    name: string;
    description: string;
    price: string;
    interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
    features: string[];
  };
}

export const EditPlanDialog: React.FC<EditPlanDialogProps> = ({ isOpen, onOpenChange, editPlanData }) => {
  const { selectedCommunityId } = useCommunityContext();
  const { updatePlan } = useSubscriptionPlans(selectedCommunityId || "");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editPlanData.name,
      description: editPlanData.description,
      price: editPlanData.price,
      interval: editPlanData.interval,
      features: editPlanData.features,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updatePlan.mutateAsync({ id: editPlanData.id, ...values, price: Number(values.price) });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update plan", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Make changes to your subscription plan here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם התוכנית</FormLabel>
                  <FormControl>
                    <Input placeholder="שם" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Input placeholder="תיאור" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מחיר</FormLabel>
                  <FormControl>
                    <Input placeholder="מחיר" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג מנוי" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
