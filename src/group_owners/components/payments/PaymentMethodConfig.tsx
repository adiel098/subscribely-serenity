
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Globe, Star, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCommunityContext } from "@/contexts/CommunityContext";

interface PaymentMethodConfigProps {
  provider: string;
  communityId?: string;
  groupId?: string;
  onSuccess: () => void;
  imageSrc?: string;
  isDefault?: boolean;
  onDefaultChange?: (value: boolean) => void;
}

export const PaymentMethodConfig = ({ 
  provider, 
  communityId,
  groupId,
  onSuccess,
  imageSrc,
  isDefault = false,
  onDefaultChange
}: PaymentMethodConfigProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDefaultSetting, setIsDefaultSetting] = useState(isDefault);
  const { selectedGroupId, selectedCommunityId, isGroupSelected } = useCommunityContext();

  // Determine which ID to use (props or context)
  const targetCommunityId = communityId || selectedCommunityId;
  const targetGroupId = groupId || selectedGroupId;

  // Fetch existing configuration if available
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('payment_methods')
          .select('config, is_default')
          .eq('provider', provider);
          
        // Add the appropriate filter based on whether we're working with a community or group
        if (isGroupSelected || targetGroupId) {
          query = query.eq('group_id', targetGroupId);
        } else {
          query = query.eq('community_id', targetCommunityId);
        }
  
        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        
        if (data) {
          setFormData(data.config || {});
          setIsDefaultSetting(data.is_default || false);
        }
      } catch (err: any) {
        console.error('Error fetching configuration:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (provider && (targetCommunityId || targetGroupId)) {
      fetchConfig();
    } else {
      setError("No community or group selected. Please select one first.");
    }
  }, [provider, targetCommunityId, targetGroupId, isGroupSelected]);

  // If isDefault prop changes, update local state
  useEffect(() => {
    setIsDefaultSetting(isDefault);
  }, [isDefault]);

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
      const targetId = isGroupSelected || targetGroupId 
        ? targetGroupId 
        : targetCommunityId;
      
      // Validate that we have a valid ID
      if (!targetId) {
        throw new Error("No community or group selected. Please select one first.");
      }

      console.log(`Saving payment method for ${isGroupSelected || targetGroupId ? 'group' : 'community'}: ${targetId}, provider: ${provider}`);
      
      // Check if the payment method already exists
      let query = supabase
        .from('payment_methods')
        .select('id');
        
      if (isGroupSelected || targetGroupId) {
        query = query.eq('group_id', targetId);
      } else {
        query = query.eq('community_id', targetId);
      }
      
      query = query.eq('provider', provider);
      
      const { data: existingMethods, error: checkError } = await query;

      if (checkError) throw checkError;

      let result;
      
      if (existingMethods?.length) {
        // Update existing payment method
        let updateQuery = supabase
          .from('payment_methods')
          .update({ 
            config: formData,
            is_default: isDefaultSetting
          })
          .eq('provider', provider);
          
        if (isGroupSelected || targetGroupId) {
          updateQuery = updateQuery.eq('group_id', targetId);
        } else {
          updateQuery = updateQuery.eq('community_id', targetId);
        }
        
        result = await updateQuery;
      } else {
        // Create new payment method
        const newMethod: any = {
          provider,
          config: formData,
          is_active: true,
          is_default: isDefaultSetting
        };

        // Add the correct ID field based on whether it's a group or community
        if (isGroupSelected || targetGroupId) {
          newMethod['group_id'] = targetId;
        } else {
          newMethod['community_id'] = targetId;
        }

        result = await supabase
          .from('payment_methods')
          .insert(newMethod);
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

  // Handle the default toggle change
  const handleDefaultToggle = (checked: boolean) => {
    setIsDefaultSetting(checked);
    if (onDefaultChange) {
      onDefaultChange(checked);
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

  if (!targetCommunityId && !targetGroupId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
        <p className="font-medium">No selection</p>
        <p className="text-sm">Please select a community or group before configuring payment methods.</p>
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
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
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
          "flex items-center justify-between p-3 rounded-lg border",
          isDefaultSetting ? "bg-amber-50 border-amber-200" : "bg-indigo-50/50 border-indigo-100"
        )}>
          <div className="flex items-center gap-2">
            {isDefaultSetting ? (
              <Star className="h-5 w-5 text-amber-500" />
            ) : (
              <Globe className="h-5 w-5 text-indigo-500" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">Set as default for all communities</span>
              <span className="text-xs text-gray-500">This payment method will be available in all your communities</span>
            </div>
          </div>
          <Switch
            checked={isDefaultSetting}
            onCheckedChange={handleDefaultToggle}
            className={cn(
              "data-[state=checked]:bg-amber-500",
              "data-[state=unchecked]:bg-gray-200"
            )}
          />
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
