
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MessagePreview } from "../MessagePreview";
import { FilterTypeSelector } from "./FilterTypeSelector";
import { toast } from "sonner";
import { useBroadcast } from "@/group_owners/hooks/useBroadcast";
import { Loader2 } from "lucide-react";

export interface BroadcastMessageFormProps {
  entityId: string;
  entityType: 'community' | 'group';
}

type FilterType = 'all' | 'active' | 'expired' | 'plan';

interface BroadcastFormValues {
  message: string;
  filterType: FilterType;
  subscriptionPlanId?: string;
}

export const BroadcastMessageForm = ({ entityId, entityType }: BroadcastMessageFormProps) => {
  const [isSending, setIsSending] = useState(false);
  const { sendBroadcastMessage } = useBroadcast();

  const form = useForm<BroadcastFormValues>({
    defaultValues: {
      message: "",
      filterType: "all"
    }
  });

  const handleSubmit = async (values: BroadcastFormValues) => {
    setIsSending(true);
    try {
      const result = await sendBroadcastMessage({
        entityId,
        entityType,
        message: values.message,
        filterType: values.filterType,
        subscriptionPlanId: values.subscriptionPlanId
      });

      if (result.success) {
        toast.success("Broadcast message sent successfully", {
          description: `Sent to ${result.sent_success} recipients, Failed: ${result.sent_failed}`
        });
        form.reset();
      } else {
        toast.error("Failed to send broadcast message", {
          description: result.error || "Please try again later"
        });
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error("Failed to send broadcast message", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsSending(false);
    }
  };

  const message = form.watch("message");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              rules={{ required: "Message is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your broadcast message here..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filterType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <FormControl>
                    <FilterTypeSelector
                      value={field.value}
                      onChange={field.onChange}
                      entityId={entityId}
                      entityType={entityType}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSending || !message.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Broadcast"
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Message Preview</h3>
            <MessagePreview
              message={message || "Your message will appear here..."}
              buttonText={message ? "Join Now" : undefined}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};
