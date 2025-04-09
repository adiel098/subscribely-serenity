
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/auth/contexts/AuthContext";

export interface CreateCommunityGroupData {
  name: string;
  description?: string;
  custom_link?: string;
  communities?: string[];
  bot_token?: string | null;
}

// Create a temporary storage for onboarding data
const onboardingTempData: {
  project?: CreateCommunityGroupData;
} = {};

export const getTempOnboardingData = () => onboardingTempData;
export const setTempProjectData = (data: CreateCommunityGroupData) => {
  onboardingTempData.project = data;
  console.log("Temporary project data saved:", data);
  return true;
};

export const useCreateCommunityGroup = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCommunityGroupData) => {
      console.log("Creating new project:", data);
      
      if (!user) {
        throw new Error("User is not authenticated");
      }
      
      try {
        // Insert into projects table
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert({
            name: data.name,
            description: data.description || null,
            owner_id: user.id,
            bot_token: data.bot_token || null
          })
          .select("*")
          .single();
        
        if (error) {
          console.error("Error creating project:", error);
          throw error;
        }
        
        if (!newProject) {
          throw new Error("Failed to create project");
        }
        
        console.log("Successfully created project:", newProject);
        
        // Link communities to this project if provided
        if (data.communities && data.communities.length > 0) {
          // Update the communities to associate them with this project
          const { error: communitiesError } = await supabase
            .from("communities")
            .update({ project_id: newProject.id })
            .in("id", data.communities);
          
          if (communitiesError) {
            console.error("Error linking communities to project:", communitiesError);
            toast.error("Warning: Some communities could not be linked to the project");
          }
        }
        
        return newProject;
      } catch (error) {
        console.error("Error in createProject mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating project:", error);
      
      let errorMessage = "Failed to create project";
      
      if (error.code === "23505") {
        errorMessage = "A project with this name already exists";
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};

// Function to commit all temporary data at the end of onboarding
export const commitOnboardingData = async () => {
  const { user } = await supabase.auth.getUser();
  
  if (!user?.data?.user) {
    console.error("User not authenticated when committing onboarding data");
    return false;
  }
  
  try {
    const tempData = getTempOnboardingData();
    if (!tempData.project) {
      console.error("No temporary project data found");
      return false;
    }
    
    // Create the project
    const { data: newProject, error } = await supabase
      .from("projects")
      .insert({
        name: tempData.project.name,
        description: tempData.project.description || null,
        owner_id: user.data.user.id,
        bot_token: tempData.project.bot_token || null
      })
      .select("*")
      .single();
    
    if (error) {
      console.error("Error creating project at the end of onboarding:", error);
      throw error;
    }
    
    // Link communities if any
    if (tempData.project.communities && tempData.project.communities.length > 0) {
      const { error: communitiesError } = await supabase
        .from("communities")
        .update({ project_id: newProject.id })
        .in("id", tempData.project.communities);
      
      if (communitiesError) {
        console.error("Error linking communities at the end of onboarding:", communitiesError);
        // Continue even if there's an error with communities
      }
    }
    
    console.log("Successfully committed onboarding data:", newProject);
    
    // Clear temporary storage
    onboardingTempData.project = undefined;
    
    return true;
  } catch (error) {
    console.error("Error committing onboarding data:", error);
    return false;
  }
};
