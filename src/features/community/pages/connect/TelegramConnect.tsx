import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCommunities } from "@/hooks/useCommunities";

const formSchema = z.object({
  communityName: z.string().min(2, {
    message: "Community name must be at least 2 characters.",
  }),
  telegramChatId: z.string().min(2, {
    message: "Telegram Chat ID must be valid.",
  }),
  publicAccess: z.boolean().default(false),
});

const TelegramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCommunityCreated, setIsCommunityCreated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetch: refetchCommunities } = useCommunities();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityName: "",
      telegramChatId: "",
      publicAccess: false,
    },
  });

  useEffect(() => {
    const communityName = searchParams.get("communityName");
    const chatId = searchParams.get("chatId");

    if (communityName) {
      form.setValue("communityName", communityName);
    }

    if (chatId) {
      form.setValue("telegramChatId", chatId);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-community', {
        body: {
          name: values.communityName,
          telegramChatId: values.telegramChatId,
          platform: 'telegram',
        },
      });

      if (error) {
        console.error("Error creating community:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create community. Please try again.",
        });
        return;
      }

      console.log("Community created successfully:", data);
      setIsCommunityCreated(true);
      toast({
        title: "Success",
        description: "Community created successfully!",
      });

      await refetchCommunities();

      navigate('/dashboard', { state: { from: '/connect/telegram' } });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-3xl py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect Telegram Community
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new community by connecting your Telegram group
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Details</CardTitle>
          <CardDescription>
            Enter your community details to connect with Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="communityName"
                render={({ field }) => (
                  <FormItem>
                    <Label>Community Name</Label>
                    <FormControl>
                      <Input placeholder="Membify Community" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telegramChatId"
                render={({ field }) => (
                  <FormItem>
                    <Label>Telegram Chat ID</Label>
                    <FormControl>
                      <Input placeholder="-1001234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="publicAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="publicAccess">Public Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anyone to join without verification
                      </p>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Community"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramConnect;
