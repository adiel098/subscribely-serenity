
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { FolderPlus, ChevronLeft } from "lucide-react";
import { useCreateProject } from "@/group_owners/hooks/useProjects";
import { GroupOwnerHeader } from "@/group_owners/components/GroupOwnerHeader";
import { useAuth } from "@/auth/contexts/AuthContext";
import { UserButton } from "@/auth/components/UserButton";

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
  const { user } = useAuth();
  
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
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-4 border-b bg-gradient-to-b from-background/10 via-background/80 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-2">
          <div className="flex cursor-pointer items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white font-semibold">
              M
            </div>
            <span className="text-lg font-semibold">Membify</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center">
            {user && <UserButton />}
          </div>
        </div>
      </header>
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-sm text-gray-500"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
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
    </>
  );
};

export default NewProject;
