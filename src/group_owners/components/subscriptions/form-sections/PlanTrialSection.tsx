
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface PlanTrialSectionProps {
  form: UseFormReturn<any>;
}

export const PlanTrialSection: React.FC<PlanTrialSectionProps> = ({ form }) => {
  const watchHasTrial = form.watch("has_trial_period");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="has_trial_period"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Free Trial Period</FormLabel>
              <FormDescription>
                Offer a free trial period for this plan
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

      {watchHasTrial && (
        <FormField
          control={form.control}
          name="trial_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trial Period (days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Number of days for the free trial period (minimum 1)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
