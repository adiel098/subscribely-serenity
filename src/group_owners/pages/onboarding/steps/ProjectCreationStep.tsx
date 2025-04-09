
import React, { useState } from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { 
  FolderPlus, 
  ArrowLeft, 
  ChevronRight, 
  Loader2, 
  Check,
  PlusCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateProject } from "@/group_owners/hooks/useProjects";
import { localStorageService } from "@/utils/localStorageService";

interface ProjectCreationStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const ProjectCreationStep: React.FC<ProjectCreationStepProps> = ({
  onComplete,
  activeStep,
  goToPreviousStep
}) => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const { toast } = useToast();
  const { mutate: createProject, isPending } = useCreateProject();

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast({
        variant: "destructive",
        title: "Project name required",
        description: "Please enter a name for your project"
      });
      return;
    }

    createProject(
      { 
        name: projectName.trim(),
        description: projectDescription.trim() || null
      },
      {
        onSuccess: (data) => {
          // Store the current project ID in localStorage
          localStorageService.setCurrentProjectId(data.id);
          toast({
            title: "Project created!",
            description: "Your project has been created successfully",
            duration: 3000,
          });
          onComplete();
        },
        onError: (error) => {
          console.error("Error creating project:", error);
          toast({
            variant: "destructive",
            title: "Failed to create project",
            description: error.message || "Please try again",
          });
        }
      }
    );
  };

  return (
    <OnboardingLayout
      currentStep="project-creation"
      title="Create Your First Project 🚀"
      description="Projects help you organize your communities and bots"
      icon={<FolderPlus className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Community"
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-gray-700">
                Description <span className="text-gray-400">(optional)</span>
              </Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A brief description of your project..."
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
          <h3 className="flex items-center font-medium text-blue-800 mb-2">
            <Check className="h-5 w-5 text-blue-600 mr-2" />
            What is a Project?
          </h3>
          <p className="text-sm text-blue-700">
            A project helps you organize multiple communities under one umbrella. 
            You can have different bots, payment methods, and settings for each project.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isPending}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleCreateProject}
            disabled={isPending || !projectName.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};

export default ProjectCreationStep;
