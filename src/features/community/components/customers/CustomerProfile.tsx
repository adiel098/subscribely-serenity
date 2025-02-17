
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/community/components/ui/avatar";
import { Button } from "@/features/community/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { Label } from "@/features/community/components/ui/label";
import { Input } from "@/features/community/components/ui/input";
import { useToast } from "@/features/community/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  telegram_username: string | null;
}

interface CustomerProfileProps {
  customer: Customer;
}

export const CustomerProfile = ({ customer }: CustomerProfileProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCustomerMutation = useMutation({
    mutationFn: async (updatedData: Partial<Customer>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', customer.id);

      if (error) throw error;
      return { ...customer, ...updatedData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer profile updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer profile",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      telegram_username: formData.get('telegram_username') as string,
    };
    updateCustomerMutation.mutate(updatedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={customer.avatar_url || undefined} />
              <AvatarFallback>
                {customer.full_name?.charAt(0) || customer.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{customer.full_name || 'Unnamed'}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={customer.full_name || ''}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email}
              />
            </div>
            <div>
              <Label htmlFor="telegram_username">Telegram Username</Label>
              <Input
                id="telegram_username"
                name="telegram_username"
                defaultValue={customer.telegram_username || ''}
              />
            </div>
          </div>

          <Button type="submit" disabled={updateCustomerMutation.isPending}>
            {updateCustomerMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
