
import { useState } from "react";
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
import { FolderPlus } from "lucide-react";
import { useCreateProject } from "@/group_owners/hooks/useProjects";

const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

const NewProject = () => {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    setIsSaving(true);
    try {
      await createProjectMutation.mutateAsync({
        name: values.name,
        description: values.description || null,
        bot_token: null,
      });
      navigate("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Create New Project"
        description="Set up a new project to manage your communities"
        icon={<FolderPlus className="h-6 w-6" />}
      />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Enter the basic details for your new project
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
                {isSaving ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default NewProject;
