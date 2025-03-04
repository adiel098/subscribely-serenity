
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PlanFormValues } from "../PlanFormSchema";

interface PlanFeaturesSectionProps {
  form: UseFormReturn<PlanFormValues>;
}

export const PlanFeaturesSection = ({ form }: PlanFeaturesSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="features"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Features</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="One feature per line" 
              rows={5}
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Enter one feature per line
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
