
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PlanFormValues } from "../PlanFormSchema";

interface PlanBasicInfoSectionProps {
  form: UseFormReturn<PlanFormValues>;
}

export const PlanBasicInfoSection = ({ form }: PlanBasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Basic, Pro, Enterprise" {...field} />
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
            <FormLabel>Price</FormLabel>
            <FormControl>
              <div className="flex">
                <div className="flex items-center justify-center bg-muted px-3 border border-r-0 rounded-l-md">
                  $
                </div>
                <Input 
                  type="number" 
                  className="rounded-l-none" 
                  step="0.01" 
                  min="0" 
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
