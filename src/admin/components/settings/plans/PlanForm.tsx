import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { planFormSchema, PlanFormValues } from "./PlanFormSchema"

interface PlanFormProps {
  onSubmit: (values: PlanFormValues) => Promise<void>
  defaultValues?: PlanFormValues
}

export function PlanForm({ onSubmit, defaultValues }: PlanFormProps) {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function handleSubmit(values: PlanFormValues) {
    return onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan name</FormLabel>
              <FormControl>
                <Input placeholder="Premium" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed to users.
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
                  placeholder="Access to all premium features"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a clear description for your plan.
              </FormDescription>
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
                <Input type="number" placeholder="9.99" {...field} />
              </FormControl>
              <FormDescription>Set the price for the plan.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing interval</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-Time</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how often users will be billed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List all the features for your plan. Add each feature on a new line."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write all the features for your plan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Whether the plan is currently active and available.
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
        <FormField
          control={form.control}
          name="max_communities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Communities</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormDescription>
                Maximum number of communities allowed for this plan.
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
              <FormLabel>Max Members per Community</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000" {...field} />
              </FormControl>
              <FormDescription>
                Maximum number of members allowed per community for this plan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
  control={form.control}
  name="has_trial_period"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div className="space-y-0.5">
        <FormLabel>Free Trial Period</FormLabel>
        <FormDescription>
          Allow users to try this plan for free before being charged
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

{form.watch("has_trial_period") && (
  <FormField
    control={form.control}
    name="trial_days"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Trial Duration (days)</FormLabel>
        <FormControl>
          <Input
            type="number"
            placeholder="7"
            {...field}
            value={field.value || ""}
          />
        </FormControl>
        <FormDescription>
          Number of days for the free trial
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
