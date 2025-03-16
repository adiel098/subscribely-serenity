
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/contexts/AuthContext";

interface PaymentMethodConfigProps {
  provider: string;
  ownerId?: string;
  onSuccess: () => void;
  imageSrc?: string;
}

export const PaymentMethodConfig = ({ 
  provider, 
  ownerId,
  onSuccess,
  imageSrc,
}: PaymentMethodConfigProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing configuration if available
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const currentUserId = ownerId || user?.id;
        
        if (!currentUserId) {
          throw new Error("User is not authenticated");
        }
        
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('owner_id', currentUserId)
          .eq('provider', provider)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setFormData(data.config || {});
        }
      } catch (err: any) {
        console.error('Error fetching configuration:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (provider && (ownerId || user?.id)) {
      fetchConfig();
    } else {
      setError("Not authenticated. Please log in first.");
    }
  }, [provider, ownerId, user?.id]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const currentUserId = ownerId || user?.id;
      
      if (!currentUserId) {
        throw new Error("User is not authenticated");
      }

      console.log(`Saving payment method for user: ${currentUserId}, provider: ${provider}`);
      
      // Check if the payment method already exists
      const { data: existingMethods, error: checkError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('owner_id', currentUserId)
        .eq('provider', provider);

      if (checkError) throw checkError;

      let result;
      
      if (existingMethods?.length) {
        // Update existing payment method
        result = await supabase
          .from('payment_methods')
          .update({ 
            config: formData,
          })
          .eq('owner_id', currentUserId)
          .eq('provider', provider);
      } else {
        // Create new payment method
        result = await supabase
          .from('payment_methods')
          .insert({
            provider,
            config: formData,
            is_active: true,
            owner_id: currentUserId
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Settings Saved Successfully",
        description: `Payment settings for ${provider} have been saved`,
        variant: "default",
      });

      // Call the success callback
      onSuccess();
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setError(err.message);
      
      toast({
        title: "Error Saving Settings",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get fields based on provider
  const getFieldsForProvider = () => {
    switch (provider) {
      case 'stripe':
        return [
          { name: 'api_key', label: 'Stripe API Key', type: 'password' },
          { name: 'public_key', label: 'Stripe Public Key', type: 'text' },
          { name: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
        ];
      case 'paypal':
        return [
          { name: 'client_id', label: 'Client ID', type: 'text' },
          { name: 'client_secret', label: 'Client Secret', type: 'password' },
        ];
      case 'crypto':
        return [
          { name: 'wallet_address', label: 'Wallet Address', type: 'text' },
          { name: 'currency', label: 'Currency (BTC, ETH, etc.)', type: 'text' },
        ];
      default:
        return [];
    }
  };

  const fields = getFieldsForProvider();

  if (!user?.id && !ownerId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
        <p className="font-medium">Authentication required</p>
        <p className="text-sm">Please log in to configure payment methods.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              required
              className="text-base border-indigo-100 focus:border-indigo-300"
            />
          </div>
        ))}

        <Separator className="my-4" />
        
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-indigo-50/50 border-indigo-100"
        )}>
          <AlertCircle className="h-5 w-5 text-indigo-500" />
          <p className="text-sm text-indigo-700">
            These payment settings will apply to all your communities and groups
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving} 
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
