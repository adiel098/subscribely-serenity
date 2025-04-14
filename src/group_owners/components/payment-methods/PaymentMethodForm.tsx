import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Info, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePaymentMethodUpdate } from "@/group_owners/hooks/usePaymentMethodUpdate";

// Schema for payment method validation
const paymentMethodSchema = z.object({
  provider_id: z.string(),
  api_key: z.string().min(4, "API Key must be at least 4 characters"),
  api_secret: z.string().min(4, "API Secret must be at least 4 characters"),
  is_sandbox: z.boolean().default(true),
  webhook_url: z.string().optional(),
  additional_settings: z.record(z.string()).optional(),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  paymentMethod?: any;
  providerId: string;
  providerName: string;
}

export const PaymentMethodForm = ({
  onSuccess,
  onCancel,
  paymentMethod,
  providerId,
  providerName,
}: PaymentMethodFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updatePaymentMethod } = usePaymentMethodUpdate();

  // Set default values based on existing payment method if available
  const defaultValues: Partial<PaymentMethodFormValues> = {
    provider_id: providerId,
    api_key: paymentMethod?.api_key || "",
    api_secret: paymentMethod?.api_secret || "",
    is_sandbox: paymentMethod?.is_sandbox !== undefined ? paymentMethod.is_sandbox : true,
    webhook_url: paymentMethod?.webhook_url || "",
    additional_settings: paymentMethod?.additional_settings || {},
  };

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues,
  });

  const onSubmit = async (data: PaymentMethodFormValues) => {
    try {
      setIsLoading(true);
      
      await updatePaymentMethod({
        provider_id: data.provider_id,
        credentials: {
          api_key: data.api_key,
          api_secret: data.api_secret,
          is_sandbox: data.is_sandbox,
          webhook_url: data.webhook_url,
          additional_settings: data.additional_settings
        }
      });

      toast.success("Payment method configured successfully");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to configure payment method";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Configure {providerName}</CardTitle>
            <CardDescription>
              Set up your payment gateway credentials
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your API key" 
                      {...field} 
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    The API key provided by {providerName}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="api_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your API secret" 
                      {...field} 
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    The API secret provided by {providerName}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_sandbox"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Sandbox Mode</FormLabel>
                    <FormDescription>
                      Use test environment for development
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

            {providerId === 'stripe' && (
              <FormField
                control={form.control}
                name="webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://your-webhook-url.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where {providerName} will send webhook events
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p>These credentials will be securely stored. Make sure you're using the correct API keys for either production or sandbox environments.</p>
              </div>
            </div>

            <CardFooter className="flex justify-end gap-2 px-0">
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
