
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PlanFormValues } from "../PlanFormSchema";

interface PlanLimitsSectionProps {
  form: UseFormReturn<PlanFormValues>;
}

export const PlanLimitsSection = ({ form }: PlanLimitsSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="max_communities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Communities</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Number of communities allowed
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="max_members_per_community"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Members Per Community</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                placeholder="Leave empty for unlimited"
                value={field.value === null ? "" : field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Leave empty for unlimited members
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
