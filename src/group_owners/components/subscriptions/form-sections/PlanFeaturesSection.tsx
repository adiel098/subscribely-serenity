
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface PlanFeaturesSectionProps {
  form: UseFormReturn<any>;
}

export const PlanFeaturesSection: React.FC<PlanFeaturesSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="features"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Features (one per line)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Full access to private content
Exclusive community benefits
Priority customer support"
              {...field}
              rows={4}
              value={field.value || ''}
            />
          </FormControl>
          <FormDescription>
            Enter each feature on a new line
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
