
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { FolderCog, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useUpdateProject, useProject } from "@/group_owners/hooks/useProjects";
import { BotTokenInput } from "@/group_owners/components/onboarding/custom-bot/BotTokenInput";

const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  is_custom_bot: z.boolean().default(false),
  bot_token: z.string().optional(),
});

const ProjectSettings = () => {
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectContext();
  const { data: project, isLoading } = useProject(selectedProjectId || undefined);
  const updateProjectMutation = useUpdateProject();
  
  const [isSaving, setIsSaving] = useState(false);
  const [tokenValidationError, setTokenValidationError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      is_custom_bot: false,
      bot_token: "",
    },
  });
  
  // Update form values when project data is loaded
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        is_custom_bot: project.is_custom_bot,
        bot_token: project.bot_token || "",
      });
    }
  }, [project, form]);
  
  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (!selectedProjectId) return;
    
    setIsSaving(true);
    setTokenValidationError(null);
    
    try {
      // If using custom bot, validate token first
      if (values.is_custom_bot && values.bot_token) {
        try {
          const response = await fetch("https://api.telegram.org/bot" + values.bot_token + "/getMe");
          const data = await response.json();
          
          if (!data.ok) {
            setTokenValidationError("Invalid bot token. Please check and try again.");
            setIsSaving(false);
            return;
          }
        } catch (error) {
          setTokenValidationError("Failed to validate bot token. Please check your internet connection and try again.");
          setIsSaving(false);
          return;
        }
      }
      
      // Update project
      await updateProjectMutation.mutateAsync({
        id: selectedProjectId,
        updates: {
          name: values.name,
          description: values.description || null,
          is_custom_bot: values.is_custom_bot,
          bot_token: values.is_custom_bot ? values.bot_token || null : null,
        }
      });
      
      navigate("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Project not found. Please select a valid project.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Project Settings"
        description="Configure your project settings and bot integration"
        icon={<FolderCog className="h-6 w-6" />}
      />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Update your project details and bot configuration
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormDescription>
                      This name will be used to identify your project.
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief description of what this project is about" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Bot Configuration</h3>
                
                <FormField
                  control={form.control}
                  name="is_custom_bot"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Use Custom Bot
                        </FormLabel>
                        <FormDescription>
                          Enable to use your own Telegram bot instead of the Membify default bot
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
                
                {form.watch("is_custom_bot") && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="bot_token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bot Token</FormLabel>
                          <FormControl>
                            <BotTokenInput
                              customTokenInput={field.value || ""}
                              setCustomTokenInput={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Get your bot token from @BotFather on Telegram
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {tokenValidationError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{tokenValidationError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving || !form.formState.isValid}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectSettings;
