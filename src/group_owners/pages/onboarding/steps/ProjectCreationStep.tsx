
import React, { useState } from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { setTempProjectData, getTempOnboardingData } from "@/group_owners/hooks/useCreateCommunityGroup";
import { toast } from "sonner";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters long"),
  description: z.string().optional()
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectCreationStepProps {
  onComplete: () => void;
  goToPreviousStep: () => void;
  activeStep: boolean;
}

const ProjectCreationStep: React.FC<ProjectCreationStepProps> = ({ 
  onComplete, 
  goToPreviousStep,
  activeStep 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tempData = getTempOnboardingData();
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: tempData.project?.name || "",
      description: tempData.project?.description || ""
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      // Store data temporarily but don't save to database yet
      const saved = setTempProjectData({
        name: data.name,
        description: data.description,
      });
      
      if (saved) {
        console.log("Project data stored temporarily:", data);
        onComplete();
      } else {
        toast.error("Failed to store project data");
      }
    } catch (error) {
      console.error("Error in project creation step:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep="project-creation"
      title="Create Your Project"
      description="Set up the main container for your community groups"
      icon={<FolderPlus className="w-6 h-6 text-indigo-500" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="My Awesome Community" 
                    {...field} 
                    className="py-6"
                  />
                </FormControl>
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
                    placeholder="Tell us about your project..."
                    {...field}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-6"
              disabled={isSubmitting}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </OnboardingLayout>
  );
};

export default ProjectCreationStep;
